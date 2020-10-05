class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObj = {...this.queryString};
        const excludeFields = ['page', 'sort', 'limit']
        excludeFields.forEach(el => delete queryObj[el]);

        // 1. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // /api/review?rating[gt]=5
        this.query.find(JSON.parse(queryStr)) //this is going to return a query
        return this;
    }

    sort(){
        //2. Sorting
        //if(this.queryString.sort){
                // const sortBy = req.query.sort.split(',').join(' ');
        //     this.query = this.query.sort(sortBy); // /api/review?sort=rating,createdAt --> this will be ascending order
                                        // for descending order do /api/review?sort=-rating
        // }else{
            // this.query = this.query.sort('-createAt');
        // }
        return this;
    }

    limitFields(){
        //3. field limiting
        //if(this.queryString.fields){
        //  const fields = this.query.sort.split(',').join(' ');
            // this.query = this.query.select(fields);
        // }else{
            // this.query = this.query.select('-__v'); //everything except the v fiield
        // }
        return this;
    }

    paginate(){
        //4. pagination ?page=2&limit=10
        // const page = this.queryString.page * 1 || 1;
        // const limit = this.queryString.limit - 1 || 100
        // const skip = (page - 1) * limit;
        //page=3&limit=10, 1-10,page1,  11-20, page2
        // this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;