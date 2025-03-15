const cheerio = require('cheerio');

async function googleLyrics(judulLagu) {
  try {
    const response = await fetch(`https://r.jina.ai/https://www.google.com/search?q=liirk+lagu+${encodeURIComponent(judulLagu)}&hl=en`, {
      headers: {
        'x-return-format': 'html',
        'x-engine': 'cf-browser-rendering',
      }
    });
    const text = await response.text();
    const $ = cheerio.load(text);
    const lirik = [];
    const output = [];
    const result = {};
    
    $('div.PZPZlf').each((i, e)=>{
      const penemu = $(e).find('div[jsname="U8S5sf"]').text().trim();
      if(!penemu) output.push($(e).text().trim())
    })

    $('div[jsname="U8S5sf"]').each((i, el) => {
      let out = '';
      $(el).find('span[jsname="YS01Ge"]').each((j, span) => {
        out += $(span).text() + '\n';
      });
      lirik.push(out.trim());
    });

    result.lyrics = lirik.join('\n\n');
    result.title = output.shift();
    result.subtitle = output.shift();
    result.platform = output.filter(_=>!_.includes(':'));
    output.forEach(_=>{
      if (_.includes(':')){
        const [ name, value ] = _.split(':');
        result[name.toLowerCase()] = value.trim();
      }
    });
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow GET method
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
  
  const { method } = req;
  if (method === 'GET') {
    const { query } = req.query; 
    if (!query) {
      return res.status(400).json({ error: 'input judul tidak valid. Pastikan judul yang diberikan benar.' });
    }

    const result = await googleLyrics(query);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(result.status).json(result);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};