import { Json, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

type DID = Record<string, string>;

const getDids = async (): Promise<Record<'dids', DID[]> | null> => {
  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([heading('Would you like to load and display your DIDs')]),
    },
  });

  if (result !== true) {
    return null;
  }

  return snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  }) as Promise<Record<'dids', DID[]>>;
};

const clearDids = async () => {
  snap.request({
    method: 'snap_manageState',
    params: { operation: 'clear' },
  });
};

const saveDid = async (params: Json[]) => {
  const dids = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as Record<'dids', Json[]>;

  if (!dids) {
    snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: { dids: [params[0]] } },
    });
    return { dids: [params[0]] };
  }

  snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { dids: [...dids.dids, params[0]] },
    },
  });

  return { dids: [...dids.dids, params[0]] };
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
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    case 'getDids':
      return getDids();
    case 'saveDid':
      return saveDid(request.params as Json[]);
    case 'clearDids':
      return clearDids();
    default:
      throw new Error('Method not found.');
  }
};
