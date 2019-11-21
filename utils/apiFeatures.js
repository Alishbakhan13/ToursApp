class apiFeaturesTours {
    constructor(query, stringQuery) {
        this.query = query;
        this.stringQuery = stringQuery;
    }

    filter() {
        //-----------------filtering-------------------------------------

        //to  make deep copy
        let filter = { ...this.stringQuery };
        const filters = ['sort', 'page', 'limit', 'filter'];
        //removing them from qury
        filters.forEach(el => delete filter[el]);

        // ------------------advance filtering----------------------

        // query format { duration: { gte: '5' }, difficulty: 'easy', sort: 'p' }
        //to  handle gte ,lte,lt,gt
        filter = JSON.stringify(filter).replace(
            /\b(gte|gt|lt|lte)\b/g,
            match => `$${match}`
        );
        filter = JSON.parse(filter);
        this.query = this.query.find(filter);
        return this;
    }

    sort() {
        //-------------------------sorting----------------------------------------------
        if (this.stringQuery.sort) {
            // mutiple format for mongodb  'price duration
            const sortBy = this.stringQuery.sort
                .split(',')
                .join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    select() {
        //------- for limiting
        if (this.stringQuery.filter) {
            // mutiple format for mongodb  'price duration
            const limitBy = this.stringQuery.filter
                .split(',')
                .join('');
            this.query = this.query.select(limitBy);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    pagelimit() {
        //------------------------------ pagination -------------------------------
        const limit = this.stringQuery.limit * 1 || 2;
        const page = this.stringQuery * 1 || 1;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        //incase of page  excedding limit
        /*
          if (this.stringQuery.page) {
              const num = await tour.countDocuments();
              if (skip >= num) {
                  throw new Error(
                      'page  number  excedding data'
                  );
              }
          }
          */
        return this;
    }
}

module.exports = apiFeaturesTours;
