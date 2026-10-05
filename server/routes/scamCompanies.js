const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const { readCollection, writeCollection } = require('../utils/localStore');

const router = express.Router();

const DEFAULT_SECTIONS = [
  {
    title: 'Historic / Infamous Ponzi & Fraud Cases',
    items: [
      'BitConnect',
      'OneCoin',
      'PlusToken',
      'WoToken',
      'Mirror Trading International (MTI)',
      'USI-Tech',
      'PlexCoin',
      'Centra Tech',
      'BitClub Network',
      'DavorCoin',
      'Forsage',
      'GainBitcoin / GBMiners',
      'MiningMax',
      'Thodex',
      'My Big Coin',
      'PayCoin / PPCoin'
    ]
  },
  {
    title: 'Rug Pulls / Pump-and-Dump / Scam Tokens',
    items: [
      'Squid Game Token ($SQUID)',
      'Banana.Fund',
      'PonziCoin',
      'DIO token',
      'Bitcoiin'
    ]
  },
  {
    title: 'Fake / Rogue Platforms and Exchanges',
    items: [
      'Xuex.net',
      'Tradecage',
      'Swaper.io',
      'Pqtic.com',
      'Ultrax.io',
      'Pure-Exchange.com',
      'Strideex.com',
      'M.Slabu.com',
      'Cjb Crypto',
      'Crymatic.com',
      'Coin-team.com',
      'DLB Exchange',
      'Nestfincs.pro',
      'Rononlineedu.com',
      'Trade-dex.net',
      'Csecrypto.com',
      'HorizonPointe Financial Group (HPFG)',
      'Cryptoipo.net',
      '1 Broker',
      'Bitcarda',
      'CenturionBooster',
      'Diamond Reserve Club',
      'Envion AG',
      'Kromtech',
      'YieldNodes'
    ]
  },
  {
    title: 'Other Frequently Reported Scam Programs / Platforms',
    items: [
      'Nova Tech FX',
      'BitFunds',
      'Energise Trade',
      'B.E.Kxpro Foundation',
      'Cryptostarbot',
      'Paytrading',
      'WTC',
      'Greencorp Investments',
      'Payswitchub',
      'MT7 coin',
      'Bitfreds',
      'CoinEquityx',
      'Quest Option',
      'Tymetradepro',
      'Fieldia',
      'Equity',
      'IC-Crypto',
      'StoneBridgeVentures',
      'EZ Invest',
      'Wefinancial',
      'MGN Group',
      'Quantumstar',
      'Prime-CC',
      'Orcalnvestment',
      'BTrade CRG',
      'TradeVision CRG',
      'Purpl',
      'Trade365 CRG',
      'Helios Expert',
      'WilliamYoungs CRG',
      'Bulltrend',
      'NTC',
      'Markethaven',
      'Fintechreserve',
      'RevenueCenter',
      'Banxso',
      'FICRM 2022',
      'Jpmreview',
      'IIA+',
      'Crownmanagers',
      'FXAlta New CRG',
      'SigmaCapitals',
      'Gemini-Tangskt',
      'Torque',
      'Witlink',
      'Abeonacoin',
      'ABX Exchange',
      'Analyfx',
      'Andex trade',
      'Ancoin Exchange',
      'AstroFx',
      'BBIC',
      'Binarymate',
      'Binary Online',
      'Binary Tilt',
      'Bit Ocean',
      'Bit Pad'
    ]
  }
];

// Helper to get formatted sections from stored scamCompanies
function getFormattedSections() {
  const allCompanies = readCollection('scamCompanies') || [];
  
  const sectionsMap = new Map();
  const defaultCategories = [
    'Historic / Infamous Ponzi & Fraud Cases',
    'Rug Pulls / Pump-and-Dump / Scam Tokens',
    'Fake / Rogue Platforms and Exchanges',
    'Other Frequently Reported Scam Programs / Platforms'
  ];

  defaultCategories.forEach(cat => sectionsMap.set(cat, []));

  allCompanies.forEach(c => {
    const cat = c.category || 'Other Frequently Reported Scam Programs / Platforms';
    if (!sectionsMap.has(cat)) {
      sectionsMap.set(cat, []);
    }
    const list = sectionsMap.get(cat);
    if (!list.includes(c.name)) {
      list.push(c.name);
    }
  });

  const result = [];
  sectionsMap.forEach((items, title) => {
    if (items.length > 0) {
      result.push({ title, items });
    }
  });
  return result;
}

// @route   GET /api/scam-companies
// @desc    Get all scam alert companies grouped by sections + raw list for admin
// @access  Public
router.get('/', (req, res) => {
  try {
    const customCompanies = readCollection('scamCompanies') || [];
    const sections = getFormattedSections();
    res.json({
      success: true,
      data: {
        sections,
        customCompanies
      }
    });
  } catch (error) {
    console.error('Fetch scam companies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scam companies' });
  }
});

// @route   POST /api/scam-companies
// @desc    Add a new scam company / program (admin only)
// @access  Private/Admin
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Company / Program name is required'),
  body('category').optional().trim(),
  body('status').optional().isIn(['warning', 'confirmed', 'investigating']),
  body('notes').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, category, status = 'confirmed', notes = '' } = req.body;
    const customCompanies = readCollection('scamCompanies') || [];

    const newCompany = {
      id: `scam_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      category: category || 'Other Frequently Reported Scam Programs / Platforms',
      status,
      notes,
      createdAt: new Date().toISOString()
    };

    customCompanies.unshift(newCompany);
    writeCollection('scamCompanies', customCompanies);

    res.json({
      success: true,
      data: {
        company: newCompany,
        sections: getFormattedSections()
      }
    });
  } catch (error) {
    console.error('Create scam company error:', error);
    res.status(500).json({ success: false, message: 'Failed to create scam company' });
  }
});

// @route   PUT /api/scam-companies/:id
// @desc    Update an existing scam company (admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim(),
  body('status').optional().isIn(['warning', 'confirmed', 'investigating']),
  body('notes').optional().trim()
], (req, res) => {
  try {
    const { id } = req.params;
    const customCompanies = readCollection('scamCompanies') || [];
    const idx = customCompanies.findIndex(c => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const updated = {
      ...customCompanies[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    customCompanies[idx] = updated;
    writeCollection('scamCompanies', customCompanies);

    res.json({
      success: true,
      data: {
        company: updated,
        sections: getFormattedSections()
      }
    });
  } catch (error) {
    console.error('Update scam company error:', error);
    res.status(500).json({ success: false, message: 'Failed to update scam company' });
  }
});

// @route   DELETE /api/scam-companies/:id
// @desc    Delete a scam company (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let customCompanies = readCollection('scamCompanies') || [];
    const initialLen = customCompanies.length;

    customCompanies = customCompanies.filter(c => c.id !== id);
    if (customCompanies.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    writeCollection('scamCompanies', customCompanies);

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: {
        sections: getFormattedSections()
      }
    });
  } catch (error) {
    console.error('Delete scam company error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete scam company' });
  }
});

module.exports = router;
