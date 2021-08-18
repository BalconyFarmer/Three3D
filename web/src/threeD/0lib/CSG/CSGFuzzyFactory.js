var CSGFuzzyFactory = function (numdimensions, tolerance) {
    this.lookuptable = {};
    this.multiplier = 1.0 / tolerance;
};

Object.assign(CSGFuzzyFactory.prototype, {

    lookupOrCreate(els, creatorCallback) {
        var hash = '';
        var multiplier = this.multiplier;
        els.forEach((el) => {
            var valueQuantized = Math.round(el * multiplier);
            hash += `${valueQuantized}/`;
        });
        if (hash in this.lookuptable) {
            return this.lookuptable[hash];
        } else {
            var object = creatorCallback(els);
            var hashparts = els.map((el) => {
                var q0 = Math.floor(el * multiplier);
                var q1 = q0 + 1;
                return [`${q0}/`, `${q1}/`];
            });
            var numelements = els.length;
            var numhashes = 1 << numelements;
            for (var hashmask = 0; hashmask < numhashes; ++hashmask) {
                var hashmask_shifted = hashmask;
                hash = '';
                hashparts.forEach((hashpart) => {
                    hash += hashpart[hashmask_shifted & 1];
                    hashmask_shifted >>= 1;
                });
                this.lookuptable[hash] = object;
            }
            return object;
        }
    },
});

export {CSGFuzzyFactory};
