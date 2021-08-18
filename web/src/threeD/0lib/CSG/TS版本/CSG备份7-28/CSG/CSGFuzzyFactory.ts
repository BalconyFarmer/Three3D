/**
 * CSG模糊处理工厂
 */
export class CSGFuzzyFactory {
    /**
     * 数据表 {}
     */
    public lookuptable: any;

    /**
     * 乘数
     */
    public multiplier: number;

    /**
     * 构造函数
     * @param numdimensions
     * @param tolerance
     */
    constructor(numdimensions: number, tolerance: number) {
        this.lookuptable = {};
        this.multiplier = 1.0 / tolerance;
    }

    /**
     * 查找或创建
     * @param els
     * @param creatorCallback
     */
    public lookupOrCreate(els: any[], creatorCallback: any): any {
        let hash = '';
        let multiplier = this.multiplier;
        els.forEach((el) => {
            let valueQuantized = Math.round(el * multiplier);
            hash += `${valueQuantized}/`;
        });
        if (hash in this.lookuptable) {
            return this.lookuptable[hash];
        } else {
            let object = creatorCallback(els);
            let hashparts = els.map((el) => {
                let q0 = Math.floor(el * multiplier);
                let q1 = q0 + 1;
                return [`${q0}/`, `${q1}/`];
            });
            let numelements = els.length;
            let numhashes = 1 << numelements;
            for (let hashmask = 0; hashmask < numhashes; ++hashmask) {
                let hashmask_shifted = hashmask;
                hash = '';
                hashparts.forEach((hashpart) => {
                    hash += hashpart[hashmask_shifted & 1];
                    hashmask_shifted >>= 1;
                });
                this.lookuptable[hash] = object;
            }
            return object;
        }
    }
}

