// tslint:disable:max-classes-per-file

import {connectedMap, dispatcherMap} from "../src";
import {connected, dispatcher} from "../src/decorators";

const decorators = () => {
  describe("decorators", () => {
    describe("@connected", () => {
      const callback = (state: any) => state.test;

      it("should add connected property to element", () => {
        class Test {
          @connected(callback)
          public prop: string = "";
        }

        const {[connectedMap]: map} = Test as any;

        expect(map).toEqual({
          prop: callback,
        });
      });
    });

    describe("@dispatcher", () => {
      it("should add dispatcher to element", () => {
        const run = () => undefined;

        class Test {
          @dispatcher
          public run: typeof run = run;

          @dispatcher
          public method(): null {
            return null;
          }
        }

        const {[dispatcherMap]: map} = Test as any;

        expect(map).toEqual(["run", "method"]);
      });
    });
  });
};

export default decorators;
