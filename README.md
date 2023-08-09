

**Côté Backend:**
- **Fichier :** `server.js` (chemin : `src/server/server.js`)
- **Endpoint dans `server.js` :** 
```javascript
app.post('/api/books', authenticateToken, upload.single('image'), resizeImageMiddleware, async (req, res) => {
```
- **Détails des middlewares :**
  1. `authenticateToken` : Fonctionne correctement.
  2. `upload.single('image')` : Fonctionne correctement.
  3. `resizeImageMiddleware` : Ne fonctionne pas.

**Observations :**
- Lorsque les middlewares 1 et 2 sont utilisés ensemble, le code fonctionne correctement.
- L'introduction du middleware 3 entraîne l'erreur `ECONNABORTED` (timeout). 
- Malgré plusieurs tentatives d'augmentation du timeout, le problème persiste. Il est donc possible que le problème ne provienne pas du timeout.

**Localisation de l'erreur :**
- L'erreur est déclenchée dans `BookForm.jsx` au sein de la fonction `onSubmit` (ligne 45). 
- Elle est attrapée (ligne 82) et affichée (ligne 83).

**Côté Frontend:**
- **Dans `BookForm.jsx` :**
  - Lignes 110 à 153 : Formulaire d'envoi du livre.
  - Ligne 110 : `onSubmit={handleSubmit(onSubmit)}` - Fonction déclenchant l'envoi.
  - Ligne 45 : Fonction `async onSubmit` qui initie `addBook`.
  - Ligne 63 : `await addBook(data)`.
  - Lignes 80 et 81 : `validate(true)` détermine l'affichage HTML de la validation de l'envoi du livre via une opération ternaire.
  
**Problème :** 
Après l'envoi du livre, la condition à la ligne 80 est initialement évaluée comme vraie. Cependant, après quelques secondes, elle est réévaluée, affichant un formulaire vide. Malgré cela, la création du livre et sa mise à l'échelle sont effectuées correctement.

---
