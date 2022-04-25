const TourModel = require("../Model/TourModel");

class CommonFeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    sort() {
        if (this.queryString.sort) {
            let sortData = this.queryString.sort.split(',').join(" ");
            this.query = this.query.sort(sortData);
        }
        return this;
    }

    projection() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields.split(',').join(" ");
            this.query = this.query.select(fields);
        }
        return this;
    }

    //Paging
    pagination() {
        if (this.queryString.page) {
            let page = parseInt(this.queryString.page) - 1;
            let limit = this.queryString.limit ? parseInt(this.queryString.limit) : 5;
            let skipData = page * limit;
            this.query = this.query.skip(skipData).limit(limit);
        }
        return this;
    }

}


module.exports = CommonFeature