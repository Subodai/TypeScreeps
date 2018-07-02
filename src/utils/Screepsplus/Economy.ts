/**
 * Economy Class
 */
export class Economy {
    /**
     * Get the current economy
     */
    public static get(): object {
        console.log("Fetching Economy");
        // Get now
        const now: number = Game.time;
        const start: number = Game.cpu.getUsed();
        const stats: { [k: string]: any } = {};
        const resources = [
            RESOURCE_ENERGY,
            // RESOURCE_POWER,
            RESOURCE_HYDROGEN,
            RESOURCE_OXYGEN,
            RESOURCE_UTRIUM,
            RESOURCE_LEMERGIUM,
            RESOURCE_KEANIUM,
            RESOURCE_ZYNTHIUM,
            RESOURCE_CATALYST,
            RESOURCE_GHODIUM
        ];
        for (const i in resources) {
            const resource = resources[i];
            const buy  = this.orderDetails(resource, ORDER_BUY, "max");
            const sell = this.orderDetails(resource, ORDER_SELL, "min");
            const [ maxBuy, avgBuy ] = buy;
            const [ minSell, avgSell ] = sell;
            stats[resource] = {
                avgBuy, avgSell, maxBuy, minSell
            };
        }
        const lastRun: number = now;
        const cpu = Game.cpu.getUsed() - start;
        return {
            cpu, lastRun, stats
        };
    }

    /**
     * Tidy way to fetch order details from the market
     */
    private static orderDetails(resourceType: ResourceConstant, type: string, mode: string): number[] {
        const orders = Game.market.getAllOrders({
            resourceType,
            type
        });
        let high: number = 0;
        if (orders.length > 0) {
            switch (mode) {
                case "max":
                    high = _.max(orders, (b: Order) => b.price).price;
                    break;
                case "min":
                    high = _.min(orders, (b: Order) => b.price).price;
                default:
                    break;
            }
        }
        const avg = _.reduce(orders, (memo, num) => {
            return memo + num.price;
        }, 0) / orders.length || 0;
        return [ high, avg ];
    }
}
