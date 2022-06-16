import { LiteGUI } from "../src/core";

function Construct (v: number, options: any)
{
    return new LiteGUI.Dragger(v, options);
}

describe("Dragger Init test", () => {
    const options = { disabled : false };
    expect(Construct(0.5, options)).toBeDefined();
});

describe("Dragger set range test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    dragger.setRange(0.1, 0.9);
    expect(dragger.options.min === 0.1 && dragger.options.max === 0.9);
});

describe("Dragger set value test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    dragger.setValue(1, false);
    expect(dragger.getValue() === 1);
});

describe("Dragger get value test", () => {
    const options = { disabled : false };
    const dragger = Construct(0.5, options);
    expect(dragger.getValue() === 0.5);
});
