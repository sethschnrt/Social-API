const { thought, user } = require("../models");

const thoughtController = {
    getAllThought(req, res) {
        thought.find({}).populate({
            path: "reactions",
            select: "-__v",
        })
        .select("-__v")
        .sort({ _id: -1 })
        .then((dbThoughtData) => res.json(dbThoughtData))
        .catch((err) => {
          console.log(err);
          res.sendStatus(400);
        });
    },

    getThoughtById({ params }, res) {
        thought.findOne({_id: params.id })
        .populate({
            path: "reactions",
            select: "-__v",
        })
        .select("-__v")
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
                res.status(404).json({ message: "There is no thought with this id!" });
            } else {
                res.json(dbThoughtData);
            }
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    createThought({ params, body }, res) {
        thought.create(body)
          .then(({ _id }) => {
            return user.findOneAndUpdate(
              { _id: body.userId },
              { $push: { thoughts: _id } },
              { new: true }
            );
          })
          .then((dbUserData) => {
            if (!dbUserData) {
              return res
                .status(404)
                .json({ message: "Thought created but there is no user with this id!" });
            }
    
            res.json({ message: "Thought successfully created!" });
          })
          .catch((err) => res.json(err));
      },

    updateThought({ params, body }, res) {
        thought.findOneAndUpdate({ _id: params.id }, body, {
            new: true,
            runValidators: true,
        })
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
                res.status(404).json({ message: "There is no thought with this id!" });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch((err) => res.json(err));
    },

    deleteThought({ params }, res) {
        thought.findOneAndDelete({ _id: params.id })
          .then((dbThoughtData) => {
            if (!dbThoughtData) {
              return res.status(404).json({ message: "There is no thought with this id!" });
            }
    
            
            return user.findOneAndUpdate(
              { thoughts: params.id },
              { $pull: { thoughts: params.id } },
              { new: true }
            );
          })
          .then((dbUserData) => {
            if (!dbUserData) {
              return res
                .status(404)
                .json({ message: "Thought created but there is no user with this id!" });
            }
            res.json({ message: "Thought successfully deleted!" });
          })
          .catch((err) => res.json(err));
      },

      addReaction({ params, body }, res) {
        thought.findOneAndUpdate(
          { _id: params.thoughtId },
          { $addToSet: { reactions: body } },
          { new: true, runValidators: true }
        )
          .then((dbThoughtData) => {
            if (!dbThoughtData) {
              res.status(404).json({ message: "There is no thought with this id" });
              return;
            }
            res.json(dbThoughtData);
          })
          .catch((err) => res.json(err));
      },
      removeReaction({ params }, res) {
        thought.findOneAndUpdate(
          { _id: params.thoughtId },
          { $pull: { reactions: { reactionId: params.reactionId } } },
          { new: true }
        )
          .then((dbThoughtData) => res.json(dbThoughtData))
          .catch((err) => res.json(err));
      },
};

module.exports = thoughtController;