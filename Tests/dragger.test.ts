import { LiteGUI } from "../src/core";

function Construct (v: number, options: any)
{
    return new LiteGUI.Dragger(v, options);
}

describe("Dragger Init test", () => {
    const options = { disabled : false };
    it("Should be defined", () => {
        expect(Construct(0.5, options)).toBeDefined();
    });
});

describe("Dragger set range test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    dragger.setRange(0.1, 0.9);
    it("Dragger options min and max should be 0.1 and 0.9", () => {
        expect(dragger.options.min).toBe(0.1);
        expect(dragger.options.max).toBe(0.9);
    });
});

describe("Dragger set value test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    dragger.setValue(1, true);
    it("Value should be 1", () => {
        expect(dragger.getValue()).toBe(1);
    });
});

describe("Dragger get value test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    it("Value should be 0.5", () => {
        expect(dragger.getValue()).toBe(0.5);
    });
});