class Inventory extends Hero {

    constructor() {
        super();
        this.items = []; 
    }

    addItem(item) {
        this.items.push(item);
    }

    useItem() {
        if (this.items.length > 0) {
            return this.items.pop(); 
        }
        console.log("Inventory empty");
        return null;
    }

    isEmpty() {
        return this.items.length === 0;
    }
}