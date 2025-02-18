import User from '../models/user.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    if(!userId) {
      throw new Error("No user found")
    }
    const user = await User.findById(userId).select('balance');
    res.status(200).json({
      ok: 1,
      data: user.balance
    });

  } catch (error) {
    res.status(500).json({ok: 0, message: error.message})
  }
}