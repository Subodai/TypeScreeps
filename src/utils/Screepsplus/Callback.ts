// Callback is a class (use with new) that stores functions to call
// back later, and they're called with a specified object.
export class Callback {
    public static handlers: any[] = [];
    /**
     * Subscribe
     * @param fn Function
     */
    public static subscribe(fn: () => void): () => void {
        return () => {
            this.handlers.push(fn);
        };
    }

    /**
     * Unsubscribe
     * @param fn Function
     */
    public static unsubscribe(fn: () => void): () => void {
        return () => {
            this.handlers = this.handlers.filter(
                (item) =>  {
                    if (item !== fn) {
                        return item;
                    }
                }
            );
        };
    }

    /**
     * Fire
     * @param o {any}
     * @param thisObj {any}
     */
    public static fire(o: any, thisObj: any): () => void {
        return () => {
            this.handlers.forEach( (item) => {
                try {
                    item.call(thisObj, o);
                } catch (err) {
                    console.log("Ignored error calling back ", item.name, "with", o, "-", err);
                }
            });
        };
    }
}
/*
function Callback() {
    this.handlers = [];  // observers
}

Callback.prototype = {

    subscribe: function (fn) {
        this.handlers.push(fn);
    },

    unsubscribe: function (fn) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    },

    fire: function (o, thisObj) {
        // TODO: Put error handling around the call?
        this.handlers.forEach(function (item) {
            try {
                item.call(thisObj, o);
            } catch (err) {
                console.log('Ignored error calling back ', item.name, 'with', o, '-', err);
            }
        });
    }
}

module.exports = {
    Callback
};
*/
