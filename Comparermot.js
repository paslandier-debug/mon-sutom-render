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