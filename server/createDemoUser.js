const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function createDemo() {
  const email = 'demo@reclaimdao.org';
  const password = 'DemoUser@1234';
  const hashedPassword = bcrypt.hashSync(password, 10);

  const demoUserData = {
    _id: 'usr_demo_1791264000000',
    firstName: 'Reclaim',
    lastName: 'Victim',
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    referralCode: 'rec786demo',
    points: 1250,
    votingRights: 8,
    verifiedLoss: 48500,
    unverifiedLoss: 12000,
    amountRestituted: 36500,
    rank: 4,
    stats: {
      votingPoints: 450,
      contributionPoints: 500,
      referralPoints: 300,
      referralCount: 3,
      totalVotes: 6,
      totalContributions: 2,
      contributionAmount: 1500
    },
    overrides: {
      rankOverride: 4
    },
    createdAt: new Date().toISOString()
  };

  // 1. Update server/data/users.json
  const usersJsonPath = path.join(__dirname, 'data/users.json');
  let localUsers = [];
  try {
    if (fs.existsSync(usersJsonPath)) {
      localUsers = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
    }
  } catch (e) {
    localUsers = [];
  }

  const existingIdx = localUsers.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    localUsers[existingIdx] = { ...localUsers[existingIdx], ...demoUserData };
    console.log('[localStore] Updated existing demo user in users.json');
  } else {
    localUsers.unshift(demoUserData);
    console.log('[localStore] Added new demo user to users.json');
  }
  fs.writeFileSync(usersJsonPath, JSON.stringify(localUsers, null, 2), 'utf8');

  // 2. If MongoDB is connected via local instance or URI, save to MongoDB as well
  try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    const User = require('./models/User');
    // Try to connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 2000 }).catch(() => {});
      }
    }
    if (mongoose.connection.readyState === 1) {
      let mongoUser = await User.findOne({ email });
      if (!mongoUser) {
        mongoUser = new User(demoUserData);
      } else {
        Object.assign(mongoUser, demoUserData);
      }
      await mongoUser.save();
      console.log('[MongoDB] Demo user saved in Mongo database');
    }
  } catch (dbErr) {
    console.log('[MongoDB Notice] MongoDB not direct, localStore users.json is active:', dbErr.message);
  }

  console.log('--- DEMO USER CREATED SUCCESSFULLY ---');
  console.log('Email:', email);
  console.log('Password:', password);
}

createDemo().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
