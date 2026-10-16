import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Configuration de la page Streamlit
st.set_page_config(
    page_title="ProfMaroc - Analytics & Statistiques",
    page_icon="📊",
    layout="wide"
)

# Titre principal
st.title("📊 Tableau de Bord Analytique - ProfMaroc")
st.markdown("Module de traitement de données et de statistiques propulsé par **Python, Pandas, NumPy et Matplotlib**.")
st.markdown("---")

# 1. Simulation ou chargement des données (Données typiques d'une plateforme de tutorat)
np.random.seed(42)
mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin']
demandes = np.random.randint(15, 60, size=len(mois))
revenus_estimes = demandes * 150  # Exemple de calcul en Dirhams

df = pd.DataFrame({
    'Mois': mois,
    'Demandes reçues': demandes,
    'Revenus (MAD)': revenus_estimes
})

# 2. Utilisation de NumPy pour les calculs statistiques clés
total_demandes = np.sum(df['Demandes reçues'])
moyenne_mensuelle = np.mean(df['Demandes reçues'])
max_demandes = np.max(df['Demandes reçues'])

# Affichage des KPIs en haut de page
col1, col2, col3 = st.columns(3)
with col1:
    st.metric(label="📈 Total Demandes (6 mois)", value=int(total_demandes))
with col2:
    st.metric(label="📊 Moyenne Mensuelle", value=f"{moyenne_mensuelle:.1f} / mois")
with col3:
    st.metric(label="🔥 Pic de Demandes", value=int(max_demandes))

st.markdown("---")

# 3. Affichage du tableau de données (Pandas)
st.subheader("📋 Données brutes traitées par Pandas")
st.dataframe(df, use_container_width=True)

st.markdown("---")

# 4. Génération de graphiques avec Matplotlib
st.subheader("📊 Visualisation Graphique (Matplotlib)")

col_g1, col_g2 = st.columns(2)

with col_g1:
    st.markdown("#### Évolution des demandes de cours")
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(df['Mois'], df['Demandes reçues'], marker='o', color='#f97316', linewidth=3, markersize=8)
    ax.set_title("Tendance des demandes", fontsize=12, fontweight='bold')
    ax.set_xlabel("Mois")
    ax.set_ylabel("Nombre de requêtes")
    ax.grid(True, linestyle='--', alpha=0.5)
    st.pyplot(fig)

with col_g2:
    st.markdown("#### Répartition des revenus estimés (MAD)")
    fig2, ax2 = plt.subplots(figsize=(6, 4))
    ax2.bar(df['Mois'], df['Revenus (MAD)'], color='#3b82f6', alpha=0.85)
    ax2.set_title("Revenus par mois", fontsize=12, fontweight='bold')
    ax2.set_xlabel("Mois")
    ax2.set_ylabel("Dirhams (MAD)")
    ax2.grid(True, axis='y', linestyle='--', alpha=0.5)
    st.pyplot(fig2)