
-- Create DB and Inventory Tables --
CREATE DATABASE storefront_DB;
USE storefront_DB;

CREATE TABLE shop_inventory (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL,
    price DECIMAL (10, 2)
);

CREATE TABLE my_inventory (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item VARCHAR(100) NOT NULL,
    count INTEGER,
    sell_price DECIMAL (10, 2)
);

-- Initial Storefront Stocks --
INSERT INTO shop_inventory (item, stock, price)
VALUES ('Spiced Snapper', 15, 3.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Hatherford Brunost', 10, 5.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Valley Truffle', 5, 10.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Crimsonwood Crabapple', 30, 1.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Caraway Rye Loaf', 20, 2.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Jagged Arrow', 500, 2.50);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Precision Arrow', 500, 5.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Smoke Bomb', 10, 20.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Explosive Bomb', 10, 25.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Health Tonic', 100, 5.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Spirit Tonic', 100, 5.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Cobalt Shield', 1, 75.00);

INSERT INTO shop_inventory (item, stock, price)
VALUES ('Valyrian Steel Sword', 1, 750.00);



-- Initial Inventory Stocks --

INSERT INTO my_inventory (item, count)
VALUES ('Gold', 500);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Spirit Tonic', 2, 2.50);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Health Tonic', 2, 2.50);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Rabbit Pelt', 8, 3.50);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Deer Pelt', 3, 12.50);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Wolftooth Bow', 1, 150);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Boarskin Boots', 1, 35);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Iron Sword', 1, 100);

INSERT INTO my_inventory (item, count, sell_price)
VALUES ('Formal Tunic', 1, 250);

