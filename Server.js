// server.js

// ==============================================
// ====   Déclaration des constantes et variables 
// ==============================================
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// ==============================================
// ====    middleware : analyse les corps de 
// ====    requêtes JSON (comme votre mot soumis)
// ============================================== 

app.use(express.json()); 

// ==============================================
// ====    Servir les fichiers statiques 
// ====    (DOIT être après app.use(express.json()) si c'est la seule ligne)
// ============================================== 

app.use(express.static(__dirname));

// ==============================================
// ====    DÉFINIR LA ROUTE RACINE (/)
// ====    Cette ligne garantit que lorsque quelqu'un accède 
// ====    à http://localhost:3000/, c'est le fichier index.html qui est envoyé.
// ============================================== 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==============================================
// ====    DEMARRER LE SERVEUR
// ====    Cette ligne garantit que lorsque quelqu'un accède 
// ====    à http://localhost:3000/, c'est le fichier index.html qui est envoyé.
// ============================================== 

app.listen(port, () => {
  console.log(`Serveur SUTOM démarré sur http://localhost:${port}`);
});

// PORT d'écoute
const PORT = 3000; 

// ==============================================
// ====    FONCTIONS et DONNEES PERSISTANTES
// ============================================== 
// >> 	1. Base de données des Mots Valides (chargée en mémoire)
// 	Charger le dictionnaire JSON une seule fois au démarrage
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>	ici 2 dictionnaires : le complet et l'extrait avec les mots de 6 lettres
// >>>>>>>>>> à optimiser pour utiliser toujours le complet pour tous les mots 6,7,8..
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const DICTIONNAIRE = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'dictionnaire.json'), 'utf8')
);
const DICO_6 = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'dictionnaire-6.json'), 'utf8')
);

// ==============================================
// ====    FONCTION : MOT DU JOUR (getMotDuJour)
// ============================================== 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>	2. Le Mot du Jour (doit être mis à jour toutes les 24h)
// >>	Pour l'instant, on prend le premier mot pour tester facilement
// >> 	à optimiser Plus tard, utiliser une BDD ou une logique de date ici
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 
function getMotDuJour(longueur = 6) {
    const motsPourLong = DICTIONNAIRE[longueur];
    if (!motsPourLong || motsPourLong.length === 0) {
        return null; 
    }    
	return motsPourLong[0]; 
}

const MOT_DU_JOUR = getMotDuJour(6); // Par exemple, choisir un mot de 6 lettres
const LONGUEUR_REQUISE = MOT_DU_JOUR.length;
console.log(`Le Mot du Jour est : ${MOT_DU_JOUR}`);

// ==============================================
// ====    FONCTION : COMPARER MOT (ComparerMots)
// ============================================== 

function comparerMots(motPropose, motCible) {
	const longueur = motCible.length;
	const resultat = new Array(longueur).fill('Bleu'); // Initialiser toutes les cases en Bleu

// 1. Créer le compteur de lettres pour le Mot Cible
	const compteurCible = {};
	for (const lettre of motCible) {
	compteurCible[lettre] = (compteurCible[lettre] || 0) + 1;
	}

// 2. Première Passe : Identifier les 'Rouge' (Bien Placées)
	for (let i = 0; i < longueur; i++) {
	if (motPropose[i] === motCible[i]) {
		resultat[i] = 'Rouge';
		// Décrémenter le compteur pour ne pas réutiliser cette lettre cible
		compteurCible[motPropose[i]]--;
		}
	}

// 3. Deuxième Passe : Identifier les 'Jaune' (Mal Placées)
	for (let i = 0; i < longueur; i++) {
	// Ignorer les lettres déjà marquées Rouge
	if (resultat[i] !== 'Rouge') {
	const lettre = motPropose[i];

	// Si la lettre existe dans le Mot Cible ET qu'il reste des occurrences disponibles
	if (compteurCible[lettre] && compteurCible[lettre] > 0) {
	resultat[i] = 'Jaune';
	// Décrémenter le compteur
	compteurCible[lettre]--;
	}
// Sinon, la lettre reste 'Bleu' (déjà initialisée)
}
}

return resultat; // Retourne un tableau comme ['Rouge', 'Jaune', 'Bleu', ...]
}
// ==================================================================


// --- Démarrage du serveur ---
// xxxx app.listen(PORT, () => {
// xxxx  console.log(`Server running on port ${PORT}`);
// xxxx });

// ==============================================
// ====    API : Première Lettre (/api/premiere_lettre)
// ============================================== 

/**
 * Route GET pour récupérer la première lettre et la longueur du mot mystère.
 * Utile pour initialiser l'affichage dans le Front-end.
 */
app.get('/api/premiere_lettre', (req, res) => {
	console.log("API: Demande de première lettre reçue.");
    // Si pour une raison quelconque le mot n'a pas été défini, gérer l'erreur
    if (!MOT_DU_JOUR || MOT_DU_JOUR.length === 0) {
        return res.status(500).json({ message: "Le mot mystère n'a pas été initialisé." });
    }

    try {
        const premiereLettre = MOT_DU_JOUR[0];
        const longueur = MOT_DU_JOUR.length;
        console.log("API: première lettre " + premiereLettre);
        // Renvoyer les informations au Front-end
        res.json({
            premiereLettre: MOT_DU_JOUR[0],
            longueur: MOT_DU_JOUR.length,
            couleur: "red" 
        });
        
    } catch (e) {
        console.error("Erreur lors de l'envoi de la première lettre:", e);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});


// ==============================================
// ====    API : Vérifier Mot soumis (/api/verifier_mot)
// ============================================== 
app.post('/api/verifier_mot', (req, res) => {
    // 1. Récupération du mot proposé depuis le Front-end
    const motPropose = req.body.mot.toUpperCase();
    console.log(`Le Mot proposé est : ${motPropose}`);

    // 2. Vérifications de base (Sécurité et Logique)
    if (!motPropose || motPropose.length !== LONGUEUR_REQUISE) {
        return res.status(400).json({ erreur: "Longueur invalide." });
    }

// -------------------------------------------------------------------------    
    if (!DICO_6.includes(motPropose)) {
        // Optionnel : renvoyer un code spécial si le mot n'est pas dans le dictionnaire
        return res.status(400).json({ erreur: "Mot non reconnu." });
    }
//    if (!DICTIONNAIRE.includes(motPropose)) {
//        // Optionnel : renvoyer un code spécial si le mot n'est pas dans le dictionnaire
//        return res.status(400).json({ erreur: "Mot non reconnu." });
//    }

// -------------------------------------------------------------------------    
    
    // 3. Logique de comparaison
    const indices = comparerMots(motPropose, MOT_DU_JOUR);
    
    // 4. Détermination de l'état du jeu
    const estGagne = indices.every(indice => indice === 'Rouge');
    
    // 5. Envoi de la réponse au Front-end
    return res.json({ 
        indices: indices, // Ex: ['Rouge', 'Jaune', 'Bleu', 'Rouge', 'Bleu']
        gagne: estGagne 
    });
});
