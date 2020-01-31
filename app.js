const express = require('express');
const app = express();
// express modulin alustus ja käyttöönotto
const path = require('path');
// path modulin alustus ja käyttö.
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// mongoose ja body-parser moduulien alustus
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream');
// crypto, multer, GridFsStorage ja GridFSStream alustus
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// body parser käyttöön
const mongoURI = 'mongodb://localhost:27017/IMGdatabase';
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
const ObjectID = require('mongodb').ObjectID;
// yhdistetään tietokantaan, tällä tavalla koska multer GridFs ja GridFs
// neuvovat näin. Tosin, tämä tapa on vanha ja aiheuttaa deprecation warningin.
// Lisäksi, useFindAndModify config koska deprecation warning(aiheutuu findOneAndDelete:stä) ja ObjectID alustus.
app.set('view engine', 'pug');
// pug view engine käyttöön
app.listen(3000);
// kuunneellan porttia 3000


let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('upload'); //nimetään collectionit
    // alustetaan stream
});

const storage = new GridFsStorage({
    // luodaan tallennustyökalu (suoraan multer GridFs:n github sivuilta)
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                // cryptosta nimi, jotta käyttäjä ei tallentele samoja tiedostoja samalla nimellä
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'upload'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });


app.get('/', (req, res) => {
    /* gfs.files.find((err, files) => {
         if (err) console.log(err);
        console.log(files);
        res.render('allIMG', { title: 'Kaikki kuvat', files: files });
    }).sort({ uploadDate: 1 });

        koetan hakea streaminkautta mongosta tietoston, mutta ei onnistu,
        gfs ei ole tässä määritelty? Kuinka saisin kokoelmasta tiedot?
        
        *19.06.2019 - Yhdistin tiedoston, jotta saisin serverin toimimaan,
        sillä en tähän hätään kerinnyt opetella asynkronisten funtioiden
        syntaksia. Alla uusia kokeiluja, sillä tämä koodi ei toimi gfs:stä huolimatta.

    /*gfs.files.find().toArray((err, files) => {
        if( !files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.json(files);
        
        *20.06.2019 Brad Traversyn arrayn tulostus, josta keksin,
        että tieto ei ollut oikeassa muodossa näytettäväksi selaimessa, josta alla: */

    gfs.files.find().toArray((err, files) => {
        // gfs.files.fin() arrayksi 
        if (!files || files.length === 0) {
            // jos tiedostoa ei ole
            return res.status(404).json({
                err: 'No files exist'
            });
        } else if (err) {
            // muu virhe
            console.log(err);
        }
        console.log('user in / route. ')
        // tiedot arrayna tietokannasta lomakkeelle
        return res.render('allIMG', { title: 'Kaikki kuvat', files: files });
    });
});

app.get('/addIMG', (req, res) => {
    console.log('user in /addIMG route. ')
    res.render('addIMG', { title: 'Lisää uusi kuva' });
    // renderöidään addIMG
});

app.post('/addIMG', upload.single('file'), (req, res) => {
    // res.json({ file: req.file }); tulostus testi req. sisällöstä
    console.log(req.file); // sama kuin yllä
    console.log('file "' + req.file.filename + '" uploaded to database.');
    res.redirect('/');
    // postataan addIMG lomakkeelta tiedosto tietokantaa, postin parametrissa, ei funktiossa. 
});

app.get('/remove/:fileid', (req, res) => {
    // poistetaan teidosto tietokannasta
    console.log('user in /remove route');
    console.log('FileID: ' + req.params.fileid);
    gfs.files.findOneAndDelete({ _id: new ObjectID(req.params.fileid) }, (err) => { /*Pitkään jumissa tämän kansssa ObjectID:n käyttö ratkaisi
    nyt req-parametit stringistä oikeaan muotoon jotta niitä voidaan käyttää */
        if (err) {
            return res.status(404).json({ err: err });
        }
        //console.log(gfs.files); tulostus testi onko oikeassa polussa
        console.log("deleted FileID: " + req.params.fileid);
        res.redirect('/');
    });
    /*let fileID = req.params.fileid;

    gfs.files.findByIdAndDelete(fileID, (err, result) => {
      if (err) {
          console.log(err);
      } else {
          console.log("deleted: "+result._id);
          res.redirect('/');
      }; 
      aiempi ei toimiva versio, josta ylempi on edelleen kehitetty, toimiva versio.
  }); */
});

app.get('/stream/:filename', (req, res) => {
    //streamataan tiedosto selaimeen käyttäjän nähtäväksi.
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // onko tiedosto
        console.log('user in /stream route.');
        console.log('Filename: ' + req.params.filename);
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // onko kuva
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/gif') {
            // readstream browseriin
            console.log('image "' + req.params.filename + '" streamed to browser.');
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
                // jos ei tiedosto
            });
        }
    });
});


/* *** 16.06.2019 Mikko Kuosmanen ***

   Ajatuksena, express mongoDB tietokanta johon voidaan tallentaa kuvia.
   lähdin toteuttamaan multer GridFs-storage versiona, koska siten tietdostojen
   koot eivät vaikuta toimivuuteen. Tällä tavalla voi myös ladata minkä
   tahansa tiedoston, mutta ohjelman laajentaminen että se tunnistaa
   tietokannasta streametessa eri tiedostot ja tekee niillä eri asioita
   olisi myöhemmän vaiheen lisäys.
   Käytin apuna Brad Traversyn tutoriaalia, mutta en tee ihan kaikkea mitä
   hän. Tutoriaali löytyy https://www.youtube.com/watch?v=3f5Q9wDePzY ja
   https://github.com/bradtraversy/mongo_file_uploads.
   Ongelmana ainakin muutujien exprottaus, vaikuttaa että ne exportataan
   ennen kuin ne sisältävät tarvittavan tietonsa, joten niitä ei voi voi
   käyttää importtaus paikassa. Kuinka tämä ratkaistaaan? Haukkasinko
   liian ison palan?

   Klo 21.18 En saanut vieläkään toimimaan, lisäsin toiminnallisuuden min-
   kä halusin kommentteina muodossa jonka arvelisin toimivan, mutta en ole
   varma toimimisesta, koska en pääse yllä aminitusta ongelmastani ylitse.
   Tunteja olen käyttänyt nyt noin 20 tuntia lisää, joista noin 17 on kulunut
   tähän tehtävään, jota en nyt saa toimimaan kuten haluan. Olen niin sanotusti
   totaalisen jumissa.

   ***19.-21.06.2019 Mikko Kuosmanen ***

   Yhdistin tiedoston, jotta saisin serverin toimimaan, sillä en tähän hätään
   kerinnyt kunnolla sisäistämään asynkronisten funtioiden syntaksia, vaikka
   ymmärränkin nyt periaatteen. Tällähetkellä lähinnä viewit omassa kansiossaan,
   ja kaikki muu app.js:ssä. Minulla meni
   noin 14 tuntia lisää saada sovellus nykyiseen tilaansa, jossa sillä voi
   ladata tiedostoja tietokantaan, nähdä kaikki tiedostot listana kotisivulla,
   streamata tiedoston selaimeen ja poistaa niitä tietokannasta. Opintojakson
   suorittamiseen käyttämästäni 169 tunnista, viimeiset 31 lopputyöhön
   käyttämääni tuntia ovat olleet oman oppimiseni kannalta antoisimpia. Ym-
   märrän nyt aiempaa paremmin, mitä ja minkämuotoista tietoa serverin ja
   tietokannan välillä liikkuu sekä minkä muotoista sen kulloinkin tulisi
   olla. Ymmärrän nyt myös paremmin tietokantaan johtavien polkujen rakennetta
   ja sitä miksi niiden tulee sisältää niitä asioita mitä ne milloinkin sisältävät. Tähän auttoi
   huomattavasti kaiken sisällön ja virheiden loggaaminen joilloin näin mitä missäkin kuljetettiin
   ja missä muodossa tiedot kulloinkin kulkivat. Tämän jälkeen tietoja tuli vain yrittää ymmärtää...
   Google haut ja tutoriaalit auttoivat, vaikka usein sisältävätkin kyseenalaisia ja vääriäkin tapoja
   tehdä asiat. Kokeilemalla ja soveltamalla näihin virallisista dokumentaatioista
   löytyviä tapoja toimivat mallit vähitellen löytyivät, mutta tämä prosessi
   on ainakin tässä vaiheessa vielä melko hidasta. Valmistajien
   dokumentaatioita ymmärtää usein vasta kokeiltuaan useaa eri tapaa,
   mutta siltikään kaikki ei ihan vielä aukene. Kun toimiva vaihtoehto löytyy,
   on vielä vaikea itse sanoa, onko sovellutus hyvä, vai jotenkin puutteellinen
   tai ohjelman toimintaa haittaava. Noh, ehkä ajan kanssa tämäkin nopeutuu ja
   ymmärrys myös koodin laadusta kehittyy.

   */