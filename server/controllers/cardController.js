const Card = require("../models/Card");

class CardController {
  // @desc    Get all cards for logged-in user
  // @route   GET /api/cards
  async getCards(req, res) {
    try {
      const cards = await Card.find({ user: req.user.id }).sort({
        createdAt: -1,
      });
      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Create a new card
  // @route   POST /api/cards
  async createCard(req, res) {
    try {
      const { nickname, lastFour, bank, type, balance } = req.body;
      const card = await Card.create({
        user: req.user.id,
        nickname,
        lastFour,
        bank,
        type,
        balance: balance || 0,
      });
      res.status(201).json({
        status: "201",
        message: "Card created SuccessFully",
        card,
      });
    } catch (error) {
      console.log("card create,", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update a card
  // @route   PUT /api/cards/:id
  async updateCard(req, res) {
    try {
      const card = await Card.findById(req.params.id);
      if (!card) return res.status(404).json({ message: "Card not found" });
      //Ensure card belongs to user
      if (card.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }
      const updateCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.json(updateCard);
    } catch (error) {
      console.log("Error from card", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a card
  // @route   DELETE /api/cards/:id
  async deleteCard(req, res) {
    try {
      const card = await Card.findById(req.params.id);

      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      if (card.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      await card.deleteOne();
      res.json({ message: "Card removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new CardController();
