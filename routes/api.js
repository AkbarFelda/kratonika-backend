const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload');

const kulinerController = require('../controllers/kulinerController');
const sejarahController = require('../controllers/sejarahController');
const wisataController = require('../controllers/wisataController');
const techController = require('../controllers/techController');
const aiController = require('../controllers/aiController');

router.get('/kuliner', kulinerController.getAllKuliner);
router.get('/kuliner/:id', kulinerController.getKulinerById); 
router.post('/kuliner', upload.single('foto'), kulinerController.createKuliner);
router.put('/kuliner/:id', upload.single('foto'), kulinerController.updateKuliner); 
router.delete('/kuliner/:id', kulinerController.deleteKuliner); 

router.get('/sejarah', sejarahController.getAllSejarah);
router.get('/sejarah/:id', sejarahController.getSejarahById);
router.post('/sejarah', sejarahController.createSejarah);
router.put('/sejarah/:id', sejarahController.updateSejarah); 
router.delete('/sejarah/:id', sejarahController.deleteSejarah); 

router.get('/wisata', wisataController.getAllWisata);
router.get('/wisata/:id', wisataController.getWisataById); 
router.post('/wisata', upload.single('foto'), wisataController.createWisata);
router.put('/wisata/:id', upload.single('foto'), wisataController.updateWisata); 
router.delete('/wisata/:id', wisataController.deleteWisata); 

router.get('/tech', techController.getAllTech);
router.get('/tech/:id', techController.getTechById); 
router.post('/tech', upload.single('foto'), techController.createTech);
router.put('/tech/:id', upload.single('foto'), techController.updateTech); 
router.delete('/tech/:id', techController.deleteTech); 

router.post('/ai/chat', aiController.handleChat);

module.exports = router;