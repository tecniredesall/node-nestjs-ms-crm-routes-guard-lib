import {
  mongoToRealmQuery,
  allowedQueryCriteria,
  convertObjectToString,
} from './index';
import * as conversionTestCases from './conversionTestCases.json';

describe('Mongo Realm query parser', () => {
  // Transverse the tests object until reaching an object with both input and
  // output properties. This object will be converted to a unit test case.
  //
  // All parent keys are converted to 'describe' for unit tests organization
  const runConversionTestCases = (cases: object) => {
    for (const [key, value] of Object.entries(cases)) {
      const childKeys = Object.keys(value);
      if (childKeys.includes('input') && childKeys.includes('output')) {
        it(key, () => {
          const realmQuery = mongoToRealmQuery(value['input']);
          expect(realmQuery).toEqual(value['output']);
        });
      } else if (childKeys.includes('input') || childKeys.includes('output')) {
        throw Error(key + ' object does not have both input and output keys');
      } else {
        describe(key, () => {
          runConversionTestCases(value);
        });
      }
    }
  };
  runConversionTestCases(conversionTestCases);
});

describe('Mongo query utilities', () => {
  it('Converts $in array of strings', () => {
    const filter = {
      _id: {
        $in: [
          '62db154d8b1fd757d5214223',
          '62db155d84c628066c41c788',
          '62db156d6959c03caf9df4d4',
        ],
      },
    };
    const convertedObj = convertObjectToString(filter);
    expect(convertedObj).not.toContain(`"0": "6", "1": "2", "2": "d"`);
    expect(convertedObj).toContain('"62db154d8b1fd757d5214223"');
    expect(convertedObj).toContain('"62db155d84c628066c41c788"');
    expect(convertedObj).toContain('"62db156d6959c03caf9df4d4"');
  });
  it('Converts property names with dot (.) correctly', () => {
    const filter = {
      'contract.name': {
        $regex: '.*jo.*',
        $options: 'i',
      },
    };
    const convertedObj = convertObjectToString(filter);
    expect(convertedObj).toContain(`{"contract.name"`);
    expect(convertedObj).not.toContain(`{contract.name`);
  });
});

describe('Mongo query criteria', () => {
  describe('Allowlist criteria', () => {
    it('should allow specified property', () => {
      const mongoQuery = {
        name: 'Carl',
      };
      const allowlist = [/^name/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, allowlist);
      expect(isQueryAllowed).toBeTruthy();
    });
    it('should not allow unspecified property', () => {
      const mongoQuery = {
        age: 45,
      };
      const allowlist = [/^name/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, allowlist);
      expect(isQueryAllowed).toBeFalsy();
    });
    it('should allow nested property', () => {
      const mongoQuery = {
        partner: {
          name: 'Carl',
        },
      };
      const allowlist = [/^partner\.name/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, allowlist);
      expect(isQueryAllowed).toBeTruthy();
    });
    it('should not allow unspecified nested property', () => {
      const mongoQuery = {
        partner: {
          age: 45,
        },
      };
      const allowlist = [/^partner\.name/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, allowlist);
      expect(isQueryAllowed).toBeFalsy();
    });
  });

  describe('Denylist criteria', () => {
    it('Should allow query that does not contain the specified property', () => {
      const mongoQuery = {
        name: 'Carl',
      };
      const denylist = [/^is_active/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, [], denylist);
      expect(isQueryAllowed).toBeTruthy();
    });
    it('Should not allow query that contains the specified property', () => {
      const mongoQuery = {
        is_active: false,
      };
      const denylist = [/^is_active/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, [], denylist);
      expect(isQueryAllowed).toBeFalsy();
    });
    it('Should not allow query that contains nested specified property', () => {
      const mongoQuery = {
        owner: {
          is_active: false,
        },
      };
      const denylist = [/^owner\.is_active/];
      const isQueryAllowed = allowedQueryCriteria(mongoQuery, [], denylist);
      expect(isQueryAllowed).toBeFalsy();
    });
  });

  describe('Allowlist + Denylist', () => {
    it('Should allow query that does not contains nested specified property', () => {
      const mongoQuery = {
        owner: {
          $or: [{ age: 40 }, { age: 20 }],
        },
      };
      const allowlist = [/^owner.*\.age/];
      const denylist = [/^owner.*\.is_active/];
      const isQueryAllowed = allowedQueryCriteria(
        mongoQuery,
        allowlist,
        denylist,
      );
      expect(isQueryAllowed).toBeTruthy();
    });
    it('Should not allow query that contains nested specified property', () => {
      const mongoQuery = {
        owner: {
          $or: [{ is_active: true }, { age: 45 }],
        },
      };
      const allowlist = [/^owner.*\.age/];
      const denylist = [/^owner.*\.is_active/];
      const isQueryAllowed = allowedQueryCriteria(
        mongoQuery,
        allowlist,
        denylist,
      );
      expect(isQueryAllowed).toBeFalsy();
    });
  });
});
