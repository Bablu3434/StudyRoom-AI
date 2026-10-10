const Note =
    require("../models/Note");


// GET ALL NOTES

const getNotes =
    async (req, res) => {

        try {

            const notes =
                await Note.find({
                    user: req.user._id
                })
                .sort({
                    pinned: -1,
                    updatedAt: -1
                });


            res.json({
                success: true,
                notes
            });

        } catch (error) {

            console.error(
                "Get Notes Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load notes"
            });

        }

    };


// CREATE NOTE

const createNote =
    async (req, res) => {

        try {

            const {
                title,
                subject,
                content,
                pinned
            } = req.body;


            if (
                !title ||
                !subject ||
                !content
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please fill all required fields"
                    });

            }


            const note =
                await Note.create({

                    user:
                        req.user._id,

                    title:
                        title.trim(),

                    subject:
                        subject.trim(),

                    content:
                        content.trim(),

                    pinned:
                        Boolean(pinned)

                });


            res.status(201).json({
                success: true,
                message:
                    "Note created successfully",
                note
            });

        } catch (error) {

            console.error(
                "Create Note Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to create note"
            });

        }

    };


// UPDATE NOTE

const updateNote =
    async (req, res) => {

        try {

            const note =
                await Note.findOne({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!note) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            const {
                title,
                subject,
                content,
                pinned
            } = req.body;


            if (title !== undefined) {
                note.title =
                    title.trim();
            }


            if (subject !== undefined) {
                note.subject =
                    subject.trim();
            }


            if (content !== undefined) {
                note.content =
                    content.trim();
            }


            if (pinned !== undefined) {
                note.pinned =
                    Boolean(pinned);
            }


            await note.save();


            res.json({
                success: true,
                message:
                    "Note updated",
                note
            });

        } catch (error) {

            console.error(
                "Update Note Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update note"
            });

        }

    };


// TOGGLE PIN

const togglePin =
    async (req, res) => {

        try {

            const note =
                await Note.findOne({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!note) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            note.pinned =
                !note.pinned;


            await note.save();


            res.json({
                success: true,
                note
            });

        } catch (error) {

            console.error(
                "Toggle Pin Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update pin"
            });

        }

    };


// DELETE NOTE

const deleteNote =
    async (req, res) => {

        try {

            const note =
                await Note.findOneAndDelete({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!note) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            res.json({
                success: true,
                message:
                    "Note deleted"
            });

        } catch (error) {

            console.error(
                "Delete Note Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete note"
            });

        }

    };


module.exports = {
    getNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote
};