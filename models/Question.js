class Question {
    constructor(context = "", options = [], ans = null, explain = "", level = 2) {
        this.Context = context;
        this.Options = options;
        this.Ans = ans;
        this.Explain = explain;
        this.level = level;
    }
}

module.exports = Question;
