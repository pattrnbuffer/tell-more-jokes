import { useContext, useEffect, useMemo, createContext } from "react";
import { array } from "../tools";

const prefix = "Identity/";
const nodeId$key = Symbol(`${prefix}NodeIdKey`);
const create$key = Symbol(`${prefix}CreateKey`);

type Identifier = number;
type IdentityContextValue = {
  [nodeId$key]: readonly Identifier[];
  [create$key]: (childId: symbol) => [IdentityContextValue, () => void];
  toString: () => string;
  toJSON: () => string;
};

const IdentityContext = createContext<IdentityContextValue>(createContextValue());

export const useIdentityContext = () => useContext(IdentityContext);
export const IdentityProvider: React.FC = (props) => {
  const context = useNewIdentityContext();

  return <IdentityContext.Provider {...props} value={context} />;
};

function useNewIdentityContext(name?: string) {
  const parentContext = useContext(IdentityContext);

  const childId = useMemo(
    () => Symbol(`${name ?? "."}:${prefix}ChildId`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parentContext],
  );
  const [context, unmount] = useMemo(
    () => parentContext[create$key](childId),
    [parentContext, childId],
  );

  useEffect(() => {
    console.log("new context", context);
    return () => {
      console.log("removing context from parent");
      unmount();
    };
  }, [context, unmount]);

  return context;
}

function createContextValue(givenId?: Identifier[]): IdentityContextValue {
  const nodeId = Object.freeze(givenId ?? [0]);
  const children = new Map<symbol, IdentityContextValue>();

  return {
    get [nodeId$key]() {
      return nodeId;
    },
    [create$key](childId: symbol) {
      if (!children.has(childId)) {
        const [parentIds, [siblingId]] = array.bisect(
          -1,
          array.last(children.values())?.[nodeId$key],
        );

        children.set(childId, createContextValue([...parentIds, siblingId + 1]));
      }

      return [children.get(childId) as IdentityContextValue, () => children.delete(childId)];
    },
    toString() {
      return nodeId.join(".");
    },
    toJSON() {
      return nodeId.join(".");
    },
  };
}
