import torch
import torch.nn as nn
import numpy as np

NUCLEOTIDES = ['A', 'C', 'G', 'U']

def one_hot_encode(seq, max_len):
    arr = np.zeros((max_len, 4), dtype=np.float32)
    for i, nt in enumerate(seq):
        if nt in NUCLEOTIDES:
            arr[i, NUCLEOTIDES.index(nt)] = 1.0
    return arr

def one_hot_decode(arr):
    seq = ''
    for row in arr:
        idx = np.argmax(row)
        seq += NUCLEOTIDES[idx]
    return seq

class SimpleRNAVAE(nn.Module):
    def __init__(self, seq_len=50, latent_dim=16):
        super().__init__()
        self.seq_len = seq_len
        self.latent_dim = latent_dim
        self.encoder = nn.Sequential(
            nn.Flatten(),
            nn.Linear(seq_len * 4, 64),
            nn.ReLU(),
            nn.Linear(64, latent_dim * 2)  # mean and logvar
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Linear(64, seq_len * 4),
            nn.Sigmoid()
        )

    def encode(self, x):
        h = self.encoder(x)
        mu, logvar = h.chunk(2, dim=-1)
        return mu, logvar

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z):
        out = self.decoder(z)
        return out.view(-1, self.seq_len, 4)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar

    def sample(self, num_samples=1):
        z = torch.randn(num_samples, self.latent_dim)
        out = self.decode(z)
        arr = out.detach().numpy()
        seqs = [one_hot_decode(row) for row in arr]
        return seqs 