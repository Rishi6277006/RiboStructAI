import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

def create_model():
    """
    Create and return a basic RNA transformer model.
    This is a placeholder for now - we'll implement the actual model later.
    """
    class RNAModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.linear = nn.Linear(768, 1)  # Placeholder layer
            
        def forward(self, x):
            return self.linear(x)
    
    return RNAModel() 