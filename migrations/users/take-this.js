/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = 'YYYYMMDD_take_this';
const CHALLENGE_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = {};
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    push = false;
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set['items.gear.owned.back_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_back_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Be the hero of your own story with your new Take This Wings!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set['items.gear.owned.body_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_body_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Tackle any obstacle with your new Take This Pauldrons!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set['items.gear.owned.head_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_head_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Protect your focus with your new Take This Helm!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set['items.gear.owned.armor_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_broad_armor_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Stand strong through any battle with your new Take This Armor!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set['items.gear.owned.weapon_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_weapon_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Slash through the toughest of tasks with your new Take This Sword!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else {
    set['items.gear.owned.shield_special_takeThis'] = true;
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_shield_special_takeThis',
          title: 'You received a Challenge reward!',
          text: 'Deflect the meanest of distractions with your new Take This Shield!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return User.updateOne({ _id: user._id }, { $set: set, $push: push }).exec();
  }
  return User.updateOne({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    challenges: CHALLENGE_ID,
  };

  const fields = {
    _id: 1,
    items: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
}
