const User = require("../modules/dbUsers");

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const updateUserActivity = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = startOfDay(new Date());
  const last = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;

  if (!last) {
    user.currentStreak = 1;
  } else {
    const diffDays = Math.floor((today - last) / 86400000);
    if (diffDays === 0) return user;
    if (diffDays === 1) user.currentStreak += 1;
    else user.currentStreak = 1;
  }

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  user.lastActiveDate = new Date();
  await user.save();
  return user;
};

module.exports = { updateUserActivity };
