const fs = require('fs');
const path = require('path');

// --- Configuration ---
const NOM_FICHIER_BRUT = 'dictionnaire_brut.txt';
const NOM_FICHIER_SORTIE = 'dictionnaire_sutom.json';
const LONGUEURS_AUTORISEES = [6, 7, 8, 9, 10]; // Ex: Mots de 6 à 10 lettres

// Caractères spéciaux que nous voulons supprimer des mots
// (apostrophes, tirets, chiffres, etc.)
const REGEX_CARACTERES_SPECIAUX = /[^A-Z]/g; 


function filtrerEtPreparerDictionnaire() {
    console.log(`Lecture du fichier brut : ${NOM_FICHIER_BRUT}...`);

    try {
        // 1. Lire le contenu du fichier brut
        const contenuFichier = fs.readFileSync(path.join(__dirname, NOM_FICHIER_BRUT), 'utf8');

        // L'objet final pour stocker les mots groupés par longueur
        const dictionnaireFinal = {};
        
        // Initialiser la structure de l'objet de sortie
        LONGUEURS_AUTORISEES.forEach(longueur => {
            dictionnaireFinal[longueur] = [];
        });

        // 2. Traiter chaque mot
        const motsBruts = contenuFichier.split('\n');

        motsBruts.forEach(motBrut => {
            // Nettoyage et Normalisation
            let motNettoye = motBrut
                .trim()             // Supprimer les espaces avant/après
                .toUpperCase()      // Mettre en majuscules
                .normalize("NFD")   // Décomposer les accents (é -> e)
                .replace( /[\u0300-\u036f]/g, "" ) // Supprimer les diacritiques (les accents)
                .replace(REGEX_CARACTERES_SPECIAUX, ''); // Supprimer les caractères spéciaux restants
            
            const longueur = motNettoye.length;

            // 3. Filtrage par longueur et existence
            if (LONGUEURS_AUTORISEES.includes(longueur) && motNettoye.length > 0) {
                // 4. Ajouter le mot à la bonne catégorie
                dictionnaireFinal[longueur].push(motNettoye);
            }
        });

        // 5. Supprimer les doublons (juste au cas où)
        LONGUEURS_AUTORISEES.forEach(longueur => {
            const listeUnique = [...new Set(dictionnaireFinal[longueur])];
            dictionnaireFinal[longueur] = listeUnique.sort(); // Trier par ordre alphabétique (optionnel)
            console.log(`-> Mots de ${longueur} lettres : ${dictionnaireFinal[longueur].length} mots.`);
        });

        // 6. Écrire le fichier JSON final
        const contenuJSON = JSON.stringify(dictionnaireFinal, null, 2);
        fs.writeFileSync(NOM_FICHIER_SORTIE, contenuJSON, 'utf8');

        console.log(`\n✅ Dictionnaire prêt et sauvegardé dans ${NOM_FICHIER_SORTIE}`);

    } catch (e) {
        console.error("❌ ERREUR lors du traitement du fichier. Assurez-vous que 'dictionnaire_brut.txt' existe et est accessible.", e);
    }
}

filtrerEtPreparerDictionnaire();