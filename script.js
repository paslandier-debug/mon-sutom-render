// --- CONFIGURATION DU JEU CÔTÉ CLIENT ---
const LONGUEUR_MOT = 6;
const PREMIERE_LETTRE = 'X';
const MAX_TENTATIVES = 6;
const URL_API_VERIFIER = '/api/verifier_mot';

// Éléments du DOM (Document Object Model)
const grilleElement = document.getElementById('grille');
const inputMot = document.getElementById('input-mot');
const boutonValider = document.getElementById('bouton-valider');
const messageErreur = document.getElementById('message-erreur');

let tentativeActuelle = 0; // Compteur de la ligne en cours
let jeuEstActif = true;    // État du jeu
let NB_COUPS = 6;

// ------------------------------------------
// 1. Initialisation de la grille et du jeu
// ------------------------------------------

// ===========================================================================================
// Nouvelle fonction (asynchrone) :
async function initializeGame() {
// xxx     
// xxx     // 1. Appel de la nouvelle API
     try {
        const response = await fetch('/api/premiere_lettre');
        const data = await response.json();
         
// xxx         // 2. Mettre à jour les paramètres du jeu
        const LONGUEUR_MOT = data.longueur;
 	const PREMIERE_LETTRE = data.premiereLettre;
         
// xxx         // 3. Créer la grille (maintenant que WORD_LENGTH est connu)
// xxx         // initialiserJeu(); 
// xxx 
// xxx         // 4. Révéler la première lettre
         afficherPremiereLettre(data.premiereLettre);
// xxx         
// xxx         // 5. Écouter les entrées clavier
// xxx		gererSoumission();
 
     } catch (error) {
         console.error("Erreur d'initialisation du jeu via l'API :", error);
         alert("Impossible de démarrer le jeu. Veuillez vérifier la connexion au // xxx serveur.");
     }
 }



// Lancer le jeu au chargement de la page
initializeGame();
// ===========================================================================================
/**
 * Génère la structure complète de la grille HTML
 * et récupère la première lettre pour l'affichage initial.
 */
function initialiserJeu() {
    // 1. Générer toutes les lignes (si elles ne sont pas dans le HTML)
    for (let i = 1; i < MAX_TENTATIVES; i++) {
        const ligne = document.createElement('div');
        ligne.classList.add('ligne');
        ligne.dataset.tentative = i;

        for (let j = 0; j < LONGUEUR_MOT; j++) {
            const caseElement = document.createElement('div');
            caseElement.classList.add('case');
            ligne.appendChild(caseElement);
        }
        grilleElement.appendChild(ligne);
    }

    // 2. Optionnel : Récupérer la première lettre via une API (Sécurité)
    // Pour cet exemple, nous allons simuler la récupération de la première lettre
     	afficherPremiereLettre(PREMIERE_LETTRE); 


    // 3. Focus sur le champ de saisie
    inputMot.focus();
}

/**
 * Affiche la première lettre dans la première case.
 */
function afficherPremiereLettre(lettre) {
    	const premiereCase = grilleElement.querySelector('.ligne[data-tentative="0"] .case:first-child');
	if (premiereCase) {
        	premiereCase.textContent = lettre;
        	premiereCase.classList.add('case-rouge'); // La première lettre est toujours Rouge
    	}
}

// ------------------------------------------
// 2. Gestion des Entrées Utilisateur
// ------------------------------------------

/**
 * Gère la soumission du mot par le bouton ou la touche Entrée.
 */
function gererSoumission() {
    if (!jeuEstActif) return;

    const motPropose = inputMot.value.toUpperCase().trim();

    if (motPropose.length !== LONGUEUR_MOT) {
        afficherMessage(`Le mot doit contenir ${LONGUEUR_MOT} lettres !`);
        return;
    }
    
    // Désactiver la saisie pendant l'attente de la réponse du serveur
    inputMot.disabled = true;
    boutonValider.disabled = true;
    
    // Appel de la fonction qui communique avec le back-end
    soumettreMotAuServeur(motPropose);
}

/**
 * Affiche un message d'erreur ou d'information.
 */
function afficherMessage(message) {
    messageErreur.textContent = message;
    setTimeout(() => {
        messageErreur.textContent = '';
    }, 3000);
}

// ------------------------------------------
// 3. Communication avec l'API Back-end
// ------------------------------------------

/**
 * Envoie le mot proposé au serveur Express pour vérification.
 * @param {string} mot Le mot soumis par le joueur.
 */
async function soumettreMotAuServeur(mot) {
    try {
        const response = await fetch(URL_API_VERIFIER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mot: mot })
        });

        const data = await response.json();

        if (response.status !== 200) {
            // Gérer les erreurs de validation du serveur (mot non valide, etc.)
            afficherMessage(data.erreur || "Erreur de validation du mot.");
            return;
        }

        // Le mot a été validé et vérifié par le serveur
        mettreAJourGrille(mot, data.indices);
        
        if (data.gagne) {
            terminerJeu(true);
        } else if (tentativeActuelle >= MAX_TENTATIVES) {
            terminerJeu(false);
        } else {
            // Préparer pour la prochaine tentative
            	tentativeActuelle++;
            	inputMot.value = ''; // Vider le champ
        }

    } catch (error) {
        console.error('Erreur API:', error);
        afficherMessage("Problème de connexion au serveur.");
    } finally {
        // Réactiver la saisie après le traitement
        inputMot.disabled = false;
        boutonValider.disabled = false;
	afficherPremiereLettre(data.premiereLettre, data.couleur);
        inputMot.focus();
    }
}

// ------------------------------------------
// 4. Mise à jour de l'Interface
// ------------------------------------------

/**
 * Applique les classes CSS (couleurs) à la ligne de grille.
 * @param {string} mot Le mot soumis (pour afficher les lettres).
 * @param {string[]} indices Le tableau d'indices du serveur ['Rouge', 'Jaune', 'Bleu', ...].
 */
function mettreAJourGrille(mot, indices) {
    const ligneElement = grilleElement.querySelector(`.ligne[data-tentative="${tentativeActuelle}"]`);
    if (!ligneElement) return;

    const cases = ligneElement.querySelectorAll('.case');

    cases.forEach((caseElement, index) => {
        const couleur = indices[index]; // 'Rouge', 'Jaune', ou 'Bleu'
        
        // 1. Afficher la lettre (si ce n'est pas la première lettre déjà affichée)
        	if (index > 0 || tentativeActuelle > 0) {
            	caseElement.textContent = mot[index];
        	}
// pl       // 1. Afficher la lettre (même si c'est la première lettre déjà affichée)
// pl		caseElement.textContent = mot[index];
        // 2. Appliquer l'animation et la couleur
        setTimeout(() => {
            caseElement.classList.add(`case-${couleur.toLowerCase()}`);
            // Optionnel : ajouter une animation de retournement ou de couleur
            caseElement.style.transform = 'scale(1.05)'; 
        }, index * 200); // Délai pour animer chaque case séquentiellement
    });
}

// ------------------------------------------
// 5. Fin de Jeu
// ------------------------------------------

/**
 * Termine la partie.
 * @param {boolean} victoire Vrai si le joueur a gagné.
 */
function terminerJeu(victoire) {
    jeuEstActif = false;
    if (victoire) {
        tentativeActuelle++;
	let NB_COUPS = tentativeActuelle;
	afficherMessage('🥳 FÉLICITATIONS ! Vous avez trouvé le mot en ' + NB_COUPS + ' coups !');
    } else {
        // Afficher le Mot du Jour si perdu (nécessite une autre route API)
        afficherMessage(`😔 Dommage ! Le mot était : ${MOT_DU_JOUR} (à implémenter)`);
    }
    inputMot.disabled = true;
    boutonValider.disabled = true;
    // Ici, vous ajouteriez la logique de partage et de statistiques.
}


// ------------------------------------------
// 6. Écouteurs d'Événements
// ------------------------------------------

// Lancer le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initialiserJeu);

// Événement : Clic sur le bouton Valider
boutonValider.addEventListener('click', gererSoumission);

// Événement : Appuyer sur la touche Entrée dans le champ de saisie
inputMot.addEventListener('keypress', (e) => {
    // Vérifiez si la touche pressée est 'Entrée' (code 13)
     if (e.key === 'Enter') { 
         gererSoumission();
     }
 });