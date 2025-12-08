// script.js (Front-end JavaScript)

function soumettreMot(mot) {
    const urlAPI = '/api/verifier_mot'; // L'URL de notre route Express

    fetch(urlAPI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Le mot proposé est envoyé dans le corps de la requête
        body: JSON.stringify({ mot: mot }) 
    })
    .then(response => response.json())
    .then(data => {
        if (data.erreur) {
            // Gérer les erreurs de longueur ou de dictionnaire
            alert(data.erreur);
            return;
        }
        
        // 1. Utiliser data.indices pour colorier la ligne de la grille
        mettreAJourGrille(mot, data.indices);
        
        // 2. Vérifier si la partie est gagnée
        if (data.gagne) {
            alert('BRAVO ! Vous avez trouvé le mot.');
            // Afficher le bouton de partage, etc.
        }
    })
    .catch(error => {
        console.error('Erreur de communication avec le serveur:', error);
        alert('Une erreur est survenue.');
    });
}

// Exemple d'appel :
// soumettreMot("POIRE");