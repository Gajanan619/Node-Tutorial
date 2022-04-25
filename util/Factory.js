exports.FindDocumentById = (Model, PopulateOptions) => async (req, res, next) => {
    try {

        let query = await Model.findById(req.params.id);
        if (PopulateOptions) {
            query = query.populate(PopulateOptions);
        }

        const result = await query;
        res.status(200).json({
            status: 'success',
            data: {
                result
            }
        });
    } catch (error) {
        next(error)
    }
};

exports.CreateDocument = Model => async (req, res, next) => {
    try {
        const result = await Model.create(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                result
            }
        });
    } catch (error) {
        next(error)
    }
};


exports.DeleteDocumentById = (Model) => async (req, res, next) => {
    try {
        debugger;
        const result = await Model.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status: 'success',
            data: {
                result
            }
        });
    } catch (error) {
        next(error)
    }
};


exports.UpdateDocumentById = (Model, QueryOptions) => async (req, res, next) => {
    try {
        debugger;
        const result = await Model.findByIdAndUpdate(req.params.id, { $set: req.body }, QueryOptions);

        res.status(200).json({
            status: 'success',
            data: {
                result
            }
        });
    } catch (error) {
        next(error);
    }
};