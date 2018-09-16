/**
 * Economy Class
 */
export class Economy {
    /**
     * Get the current economy
     */
    public static get(): object {
        // Get now
        const now: number = Game.time;
        const start: number = Game.cpu.getUsed();
        const stats: { [k: string]: any } = {};
        const resources = [
            // Energy + Power
            RESOURCE_ENERGY,
            // RESOURCE_POWER,

            // Base Resources
            RESOURCE_UTRIUM,
            RESOURCE_LEMERGIUM,
            RESOURCE_KEANIUM,
            RESOURCE_ZYNTHIUM,
            RESOURCE_OXYGEN,
            RESOURCE_HYDROGEN,
            RESOURCE_CATALYST,

            // // Base compounds
            RESOURCE_HYDROXIDE,
            RESOURCE_ZYNTHIUM_KEANITE,
            RESOURCE_UTRIUM_LEMERGITE,
            RESOURCE_GHODIUM,

            // // Tier 1 Compounds
            RESOURCE_UTRIUM_HYDRIDE,
            RESOURCE_UTRIUM_OXIDE,
            RESOURCE_KEANIUM_HYDRIDE,
            RESOURCE_KEANIUM_OXIDE,
            RESOURCE_LEMERGIUM_HYDRIDE,
            RESOURCE_LEMERGIUM_OXIDE,
            RESOURCE_ZYNTHIUM_HYDRIDE,
            RESOURCE_ZYNTHIUM_OXIDE,
            RESOURCE_GHODIUM_HYDRIDE,
            RESOURCE_GHODIUM_OXIDE,

            // Tier 2 Compounds
            RESOURCE_UTRIUM_ACID,
            RESOURCE_UTRIUM_ALKALIDE,
            RESOURCE_KEANIUM_ACID,
            RESOURCE_KEANIUM_ALKALIDE,
            RESOURCE_LEMERGIUM_ACID,
            RESOURCE_LEMERGIUM_ALKALIDE,
            RESOURCE_ZYNTHIUM_ACID,
            RESOURCE_ZYNTHIUM_ALKALIDE,
            RESOURCE_GHODIUM_ACID,
            RESOURCE_GHODIUM_ALKALIDE,

            // T3 Compounds
            RESOURCE_CATALYZED_UTRIUM_ACID,
            RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
            RESOURCE_CATALYZED_KEANIUM_ACID,
            RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
            RESOURCE_CATALYZED_LEMERGIUM_ACID,
            RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
            RESOURCE_CATALYZED_ZYNTHIUM_ACID,
            RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
            RESOURCE_CATALYZED_GHODIUM_ACID,
            RESOURCE_CATALYZED_GHODIUM_ALKALIDE
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
