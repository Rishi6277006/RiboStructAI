from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import RNA
from models.rna_transformer import create_model
import torch
import numpy as np
from typing import Dict, Any
import os
import networkx as nx
import logging
from transformers import pipeline, AutoTokenizer
import re
import requests
from io import BytesIO
from models.rna_vae_simple import SimpleRNAVAE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

# Initialize model
try:
    model = create_model()
    if torch.cuda.is_available():
        model = model.cuda()
    logger.info("Model initialized successfully")
except Exception as e:
    logger.error(f"Error initializing model: {str(e)}")
    model = None

PRETRAINED = "raynardj/ner-gene-dna-rna-jnlpba-pubmed"
ner_pipeline = pipeline(task="ner", model=PRETRAINED, tokenizer=PRETRAINED)
tokenizer = AutoTokenizer.from_pretrained(PRETRAINED)

vae_model = SimpleRNAVAE(seq_len=50, latent_dim=16)
vae_model.eval()  # Not trained, but works for demo

def clean_output(outputs):
    results = []
    current = []
    last_idx = 0
    for output in outputs:
        if output["index"]-1 == last_idx:
            current.append(output)
        else:
            results.append(current)
            current = [output, ]
        last_idx = output["index"]
    if len(current) > 0:
        results.append(current)
    strings = []
    for c in results:
        tokens = []
        starts = []
        ends = []
        for o in c:
            tokens.append(o['word'])
            starts.append(o['start'])
            ends.append(o['end'])
        new_str = tokenizer.convert_tokens_to_string(tokens)
        if new_str != '':
            strings.append(dict(
                word=new_str,
                start=min(starts),
                end=max(ends),
                entity=c[0]['entity']
            ))
    return strings

def predict_structure(sequence: str) -> Dict[str, Any]:
    """Predict RNA secondary structure using ViennaRNA."""
    try:
        md = RNA.md()
        fc = RNA.fold_compound(sequence, md)
        (ss, mfe) = fc.mfe()
        
        return {
            'structure': ss,
            'mfe': float(mfe)
        }
    except Exception as e:
        logger.error(f"Error in structure prediction: {str(e)}")
        raise ValueError(f"Failed to predict structure: {str(e)}")

def create_visualization(sequence: str, structure: str) -> Dict[str, Any]:
    """Create visualization data for the RNA structure."""
    # Create a graph representation
    G = nx.Graph()

    # Add nodes (nucleotides)
    for i, nuc in enumerate(sequence):
        G.add_node(i, nucleotide=nuc)

    # Add edges (base pairs)
    stack = []
    for i, char in enumerate(structure):
        if char == '(': 
            stack.append(i)
        elif char == ')':
            if stack:
                j = stack.pop()
                G.add_edge(i, j)

    # Create layout
    pos = nx.spring_layout(G, seed=42)

    # Edge trace (base pairs)
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    # Node trace
    node_x = []
    node_y = []
    node_text = []
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        node_text.append(f"{G.nodes[node]['nucleotide']}{node+1}")

    return {
        'data': [
            {
                'x': edge_x,
                'y': edge_y,
                'type': 'scatter',
                'mode': 'lines',
                'line': {'width': 2, 'color': '#888'},
                'hoverinfo': 'none',
                'showlegend': False
            },
            {
                'x': node_x,
                'y': node_y,
                'type': 'scatter',
                'mode': 'markers+text',
                'text': node_text,
                'hoverinfo': 'text',
                'marker': {
                    'showscale': False,
                    'color': '#1976d2',
                    'size': 16,
                    'line': {'width': 2, 'color': '#fff'}
                },
                'textposition': 'top center',
                'showlegend': False
            }
        ]
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_sequence():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': 'No data provided'
            }), 400
            
        sequence = data.get('sequence', '').upper()
        
        if not sequence:
            return jsonify({
                'status': 'error',
                'error': 'No sequence provided'
            }), 400
        
        # Validate sequence
        if not all(nuc in 'ACGU' for nuc in sequence):
            return jsonify({
                'status': 'error',
                'error': 'Invalid sequence. Only A, C, G, and U are allowed.'
            }), 400
        
        # Predict structure
        structure_result = predict_structure(sequence)
        
        # Create visualization
        visualization = create_visualization(sequence, structure_result['structure'])
        
        # Prepare response
        response = {
            'status': 'success',
            'data': {
                'sequence': {
                    'sequence': sequence,
                    'structure': structure_result['structure'],
                    'mfe': structure_result['mfe']
                },
                'predictedStructure': structure_result['structure'],
                'bindingSites': [],  # To be implemented
                'visualization': visualization
            }
        }
        
        return jsonify(response)
    
    except ValueError as ve:
        return jsonify({
            'status': 'error',
            'error': str(ve)
        }), 400
    except Exception as e:
        logger.error(f"Error in analyze_sequence: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Internal server error'
        }), 500

@app.route('/api/predict-binding', methods=['POST'])
def predict_binding():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': 'No data provided'
            }), 400

        sequence = data.get('sequence', '').upper()
        molecule = data.get('molecule')
        if not sequence:
            return jsonify({
                'status': 'error',
                'error': 'No sequence provided'
            }), 400

        if not molecule:
            molecule = {
                'name': 'LigandX',
                'smiles': 'CCO'
            }

        # Validate sequence
        if not all(nuc in 'ACGU' for nuc in sequence):
            return jsonify({
                'status': 'error',
                'error': 'Invalid sequence. Only A, C, G, and U are allowed.'
            }), 400

        # Predict structure
        structure_result = predict_structure(sequence)
        visualization = create_visualization(sequence, structure_result['structure'])

        # Find poly-G, poly-C, poly-A, poly-U regions (3 or more consecutive)
        binding_sites = []
        for motif, label in [(r'G{3,}', 'Poly-G'), (r'C{3,}', 'Poly-C'), (r'A{3,}', 'Poly-A'), (r'U{3,}', 'Poly-U')]:
            for match in re.finditer(motif, sequence):
                binding_sites.append({
                    'start': match.start(),
                    'end': match.end() - 1,
                    'confidence': 0.9,
                    'molecule': molecule,
                    'label': label
                })

        # Prepare response
        response = {
            'status': 'success',
            'data': {
                'sequence': {
                    'sequence': sequence,
                    'structure': structure_result['structure'],
                    'mfe': structure_result['mfe']
                },
                'predictedStructure': structure_result['structure'],
                'bindingSites': binding_sites,
                'visualization': visualization
            }
        }

        return jsonify(response)

    except ValueError as ve:
        return jsonify({
            'status': 'error',
            'error': str(ve)
        }), 400
    except Exception as e:
        logger.error(f"Error in predict_binding: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Internal server error'
        }), 500

@app.route('/api/ner', methods=['POST'])
def ner_analysis():
    try:
        data = request.get_json()
        sequence = data.get('sequence', '').upper()
        if not sequence:
            return jsonify({'status': 'error', 'error': 'No sequence provided'}), 400

        entities = []
        # Start codon
        for match in re.finditer('AUG', sequence):
            entities.append({
                "start": match.start(),
                "end": match.end() - 1,
                "type": "start_codon",
                "label": "Start Codon (AUG)"
            })
        # Stop codons
        for codon, label in [("UAA", "Stop Codon (UAA)"), ("UAG", "Stop Codon (UAG)"), ("UGA", "Stop Codon (UGA)")]:
            for match in re.finditer(codon, sequence):
                entities.append({
                    "start": match.start(),
                    "end": match.end() - 1,
                    "type": "stop_codon",
                    "label": label
                })
        # Poly-U
        for match in re.finditer('UUU', sequence):
            entities.append({
                "start": match.start(),
                "end": match.end() - 1,
                "type": "poly_U",
                "label": "Poly-U (UUU)"
            })
        # Poly-G
        for match in re.finditer('GGG', sequence):
            entities.append({
                "start": match.start(),
                "end": match.end() - 1,
                "type": "poly_G",
                "label": "Poly-G (GGG)"
            })
        # Simple hairpin loop: GNNNNNCC (N = any nucleotide)
        for match in re.finditer(r'G[ACGU]{5}CC', sequence):
            entities.append({
                "start": match.start(),
                "end": match.end() - 1,
                "type": "hairpin_loop",
                "label": "Hairpin Loop (GNNNNNCC)"
            })

        return jsonify({'status': 'success', 'data': {'entities': entities}})
    except Exception as e:
        logger.error(f"Error in ner_analysis: {str(e)}")
        return jsonify({'status': 'error', 'error': 'Internal server error'}), 500

@app.route('/api/fetch-pdb', methods=['GET'])
def fetch_pdb():
    pdb_id = request.args.get('pdb_id', '').upper()
    print('Requested PDB ID:', pdb_id)
    if not pdb_id:
        print('No PDB ID provided')
        return jsonify({'error': 'No PDB ID provided'}), 400
    url = f'https://files.rcsb.org/download/{pdb_id}.pdb'
    print('Fetching URL:', url)
    r = requests.get(url)
    print('RCSB status:', r.status_code)
    print('RCSB content:', r.text[:200])
    if r.status_code != 200:
        print('PDB not found at RCSB')
        return jsonify({'error': 'PDB not found'}), 404
    print('PDB fetched successfully, returning file')
    return send_file(BytesIO(r.content), mimetype='text/plain', as_attachment=False, download_name=f'{pdb_id}.pdb')

@app.route('/api/generate-rna', methods=['POST'])
def generate_rna():
    data = request.get_json()
    num_samples = int(data.get('num_samples', 5))
    seq_len = int(data.get('length', 50))
    vae_model.seq_len = seq_len
    seqs = vae_model.sample(num_samples)
    return jsonify({'sequences': seqs})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 