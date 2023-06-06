import { Json, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

type Address = string;
type DID = Record<Address, Json>;

/**
 * Returns DID saved for given address.
 *
 * @param params - List of arguments. Should contain address at index 0.
 */
const getDid = async (params: Json[]): Promise<Json | null> => {
  const addr = params[0] as string;
  if (!addr) {
    return null;
  }

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Would you like to display did for given address ${addr}?`),
      ]),
    },
  });

  if (result !== true) {
    return null;
  }

  const dids = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as DID;

  if (!dids) {
    return null;
  }

  return dids[addr];
};

const clearDids = async () => {
  snap.request({
    method: 'snap_manageState',
    params: { operation: 'clear' },
  });
};

/**
 * Saves did inside encrypted storage.
 *
 * @param params - List of arguments. Should contain Record<Address, Json> at index 0.
 */
const saveDid = async (params: Json[]) => {
  const did = params[0] as Record<Address, Json>;
  const dids = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as Record<Address, Json>;

  if (!dids) {
    snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: { ...did } },
    });
    return { ...did };
  }

  snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { ...dids, ...did },
    },
  });

  return { ...dids, ...did };
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'My message',
            ),
          ]),
        },
      });
    case 'getDid':
      return getDid(request.params as Json[]);
    case 'saveDid':
      return saveDid(request.params as Json[]);
    case 'clearDids':
      return clearDids();
    default:
      throw new Error('Method not found.');
  }
};
