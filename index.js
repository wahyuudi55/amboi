var express = require("express"), cors = require("cors"), secure = require("ssl-express-www");
const path = require('path');
const os = require('os');
const fs = require('fs');
const wxd = require('./function/index') 
const axios = require('axios')

var app = express();
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(secure);
app.use(express.static(path.join(__dirname, 'public')));
const port = 3000;

app.get('/stats', (req, res) => {
  const stats = {
    platform: os.platform(),
    architecture: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    cpuModel: os.cpus()[0].model,
    numCores: os.cpus().length,
    loadAverage: os.loadavg(),
    hostname: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    osType: os.type(),
    osRelease: os.release(),
    userInfo: os.userInfo(),
    processId: process.pid,
    nodeVersion: process.version,
    execPath: process.execPath,
    cwd: process.cwd(),
    memoryUsage: process.memoryUsage()
  };
  res.json(stats);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,  'index.html'));
});

// Logic Detect (AI)
app.get('/api/ai/logic-detect', async (req, res) => {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Masukkan text terlebih dahulu' });
    }
    const apiurl = `https://api.vreden.web.id/api/logic?query=${encodeURIComponent(text)}`;
    const response = await axios.get(apiurl);
    const { cmd, query } = response.data.result;
    res.status(200).json({
      status: 200,
      creator: 'whyuxD',
      data: {
        cmd: cmd,
        query: query
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ai html
app.get('/api/ai/web-html', async (req, res) => {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Masukkan prompt text!' });
    }
    const response = await axios.get(`https://fastrestapis.fasturl.cloud/aillm/blackbox?ask=buatkan code website html ${encodeURIComponent(text)}, menggunakan copyright/wm ©DarkBot, kirim code nya tanpa terpisah, gabungkan dalam satu file .html&model=blackbox`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': 'f9b31bea-15a3-438b-9bac-7f5ca0a1f895'
      }
    });
    if (!response.data.result) {
      return res.status(500).json({ error: 'Gagal membuat code' });
    }
    const raw = response.data.result;
    const match = raw.match(/```html([\s\S]*?)```/i);
    const htmlCode = match ? match[1].trim() : raw.trim();

    if (!htmlCode.toLowerCase().includes('<!doctype')) {
      return res.status(500).json({ error: 'Gagal membuat kode HTML' });
    }
    res.status(200).json({
      status: 200,
      creator: "whyuxD"
      result: htmlCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Character Ai (AI)
app.get('/api/ai/chai', async (req, res) => {
  try {
    const { text, gaya } = req.query;
    if (!text || !gaya) {
      return res.status(400).json({ error: 'Masukkan dulu format text dan gaya dari Character nya' });
    }
    const apiurl = `https://api.nyxs.pw/ai/character-ai?prompt=${text}&gaya=${gaya}`;
    const response = await axios.get(apiurl);
    const { result } = response.data;
    res.status(200).json({
      status: 200,
      creator: 'whyuxD',
      response: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Gpt (AI)
app.get("/api/gpt", async (req, res) => {
const text = req.query.text;
if (!text) {
return res.status(400).send("Parameter 'text' is required!");
}
try {
const requestData = {
operation: "chatExecute",
params: {
text: text,
languageId: "6094f9b4addddd000c04c94b",
toneId: "60572a649bdd4272b8fe358c",
voiceId: ""
}
};
const config = {
headers: {
Accept: "application/json, text/plain, */*",
Authentication: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTZjMjFhMGE1NTNiNjE1MDhmNWIxOSIsImlhdCI6MTcxMjc2NzUxNH0.qseE0iNl-4bZrpQoB-zxVsc-pz13l3JOKkg4u6Y08OY",
"Content-Type": "application/json"
}
};
let {data} = await axios.post("https://api.rytr.me/", requestData, config)
data.data.content = data.data.content.replace(/<\/?p[^>]*>/g, '');
res.json(data);
} catch (error) {
console.error(error);
res.status(500).send("Internal Server Error");
}
});

// Lirik (SARCH)
app.get('/api/search/lirik', async (req, res) => {
  try {
    const { lagu } = req.query;
    if (!lagu) {
      return res.status(400).json({ error: 'Masukkan judul lagunya!' });
    }
    const apiurl = `https://api.vreden.web.id/api/lirik?lagu=${encodeURIComponent(lagu)}`;
    const response = await axios.get(apiurl);
    const { result } = response.data;
    if (!result || !result.lyrics || !result.artist || !result.image) {
      return res.status(404).json({ error: 'Lirik tidak ditemukan!' });
    }
    res.status(200).json({
      status: 200,
      creator: 'whyuxD',
      lyrics: result.lyrics,
      artist: result.artist,
      thumbnail: result.image
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Meme (RANDOM)
app.get('/api/random/meme', async (req, res) => {
  try {
    const response = await axios.get('https://api.vreden.my.id/api/meme');    
    if (!response.data.result) {
      return res.status(500).json({ error: 'Gagal mengambil data dari API' });
    }
    const imageUrl = response.data.result;
    const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'image/jpeg');
    imageResponse.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Brat (TOOLS)
app.get('/api/tools/brat', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Masukkan query terlebih dahulu!' });
    }   
    const apiUrl = `https://vapis.my.id/api/bratv1?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'image/jpeg');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ssweb (TOOLS)
app.get('/api/tools/ssweb', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Masukkan URL website dulu woi!' });
    }
    const apiurl = `https://api.vreden.my.id/api/ssweb?url=${encodeURIComponent(url)}&type=tablet`;
    const response = await axios.get(apiurl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'image/png');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ada kesalahan pada server');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
