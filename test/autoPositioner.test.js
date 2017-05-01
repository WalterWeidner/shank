import {expect} from 'chai';

import injector from 'inject-loader!../src/autoPositioner';

describe('autoPositioner', () => {

  it('should fail', () => {

    let autoPositioner = injector({
      './utils': {
        poop: () => {
          return true;
        }
      }
    });

    console.dir(autoPositioner);

    expect(autoPositioner.crap()).to.equal(true);
  });

});
