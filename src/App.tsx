import {
  AzureCommunicationTokenCredential,
  CommunicationUserIdentifier,
} from '@azure/communication-common';
import {
  CallComposite,
  ChatComposite,
  fromFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter,
  useAzureCommunicationChatAdapter,
} from '@azure/communication-react';
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatClient } from '@azure/communication-chat';
import { initializeIcons } from '@fluentui/react';
import { downloadOptions } from "./AttachmentDownloadOptions";
import { uploadOptions } from "./AtachmentUploadOptions";

/**
 * Authentication information needed for your client application to use
 * Azure Communication Services.
 *
 * For this quickstart, you can obtain these from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/identity/quick-create-identity
 *
 * In a real application, your backend service would provide these to the client
 * application after the user goes through your authentication flow.
 */
const ENDPOINT_URL = 'https://poc-acs-chat.brazil.communication.azure.com';
const USER_ID = '8:acs:5cb10d42-da75-4d37-baae-c37aa093ae5e_00000020-e9ad-dc6c-9c32-8e3a0d00d7ce';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjVjYjEwZDQyLWRhNzUtNGQzNy1iYWFlLWMzN2FhMDkzYWU1ZV8wMDAwMDAyMC1lOWFkLWRjNmMtOWMzMi04ZTNhMGQwMGQ3Y2UiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTkyMjUwMzgiLCJleHAiOjE3MTkzMTE0MzgsInJnbiI6ImJyIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiNWNiMTBkNDItZGE3NS00ZDM3LWJhYWUtYzM3YWEwOTNhZTVlIiwicmVzb3VyY2VMb2NhdGlvbiI6ImJyYXppbCIsImlhdCI6MTcxOTIyNTAzOH0.eX1-SomTn09n7s9nDRa8xzbhb144nWC6qFD-0nj95zexRYp-BAeI0H5QpDQ1191i8IIaBwwmAj4ZzWgutfYUg5Fajv3DUGC275VV2Rq8-1LNOImQt64EurTRN3pNEREPWce1z4-94tjyNYtJ7mwpSh7lTPBWaRY1P5YmLGruZYjWl5c5iMwyOOeQ_XLsVNd6S1DuVmeDcquElMduThgTYAVmExry_vKT5wvEoIp_HezPeYTmtv-npP59tvDwOx8hynJN4rvclP41sG27yDfaxy_K25UPbcoKvwqTVri7p52dp-F5cyVBYJKbvMzdtalBJkbam3IbDHGDwbRqhdpRlQ';

/**
 * Display name for the local participant.
 * In a real application, this would be part of the user data that your
 * backend services provides to the client application after the user
 * goes through your authentication flow.
 */
const DISPLAY_NAME = 'Alexandre Costa';

initializeIcons();

/**
 * Entry point of your application.
 */
function App(): JSX.Element {
  // Arguments that would usually be provided by your backend service or
  // (indirectly) by the user.
  const { endpointUrl, userId, token, displayName, groupId, threadId } =
    useAzureCommunicationServiceArgs();

  // A well-formed token is required to initialize the chat and calling adapters.
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [token]);

  // Memoize arguments to `useAzureCommunicationCallAdapter` so that
  // a new adapter is only created when an argument changes.
  const callAdapterArgs = useMemo(
    () => ({
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      locator: {
        groupId,
      },
    }),
    [userId, credential, displayName, groupId]
  );
  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

  // Memoize arguments to `useAzureCommunicationChatAdapter` so that
  // a new adapter is only created when an argument changes.
  const chatAdapterArgs = useMemo(
    () => ({
      endpoint: endpointUrl,
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      threadId,
    }),
    [endpointUrl, userId, displayName, credential, threadId]
  );
  const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

  if (!!callAdapter && !!chatAdapter) {
    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <div style={containerStyle}>          
          <ChatComposite
          adapter={chatAdapter}
          options={{
            attachmentOptions: {
              uploadOptions: uploadOptions,
              downloadOptions: downloadOptions,
            }
          }}
        />
        </div>
        <div style={containerStyle}>
          <CallComposite adapter={callAdapter} />
        </div>
      </div>
    );
  }
  if (credential === undefined) {
    return (
      <h3>Failed to construct credential. Provided token is malformed.</h3>
    );
  }
  return <h3>Initializing...</h3>;
}

const containerStyle: CSSProperties = {
  border: 'solid 0.125rem olive',
  margin: '0.5rem',
  width: '50vw',
};
/**
 * This hook returns all the arguments required to use the Azure Communication services
 * that would be provided by your backend service after user authentication
 * depending on the user-flow (e.g. which chat thread to use).
 */
function useAzureCommunicationServiceArgs(): {
  endpointUrl: string;
  userId: string;
  token: string;
  displayName: string;
  groupId: string;
  threadId: string;
} {
  const [threadId, setThreadId] = useState('');
  // For the quickstart, create a new thread with just the local participant in it.
  useEffect(() => {
    (async () => {
      const client = new ChatClient(
        ENDPOINT_URL,
        new AzureCommunicationTokenCredential(TOKEN)
      );
      const { chatThread } = await client.createChatThread(
        {
          topic: 'Composites Quickstarts',
        },
        {
          participants: [
            {
              id: fromFlatCommunicationIdentifier(USER_ID),
              displayName: DISPLAY_NAME,
            },
          ],
        }
      );
      setThreadId(chatThread?.id ?? '');
    })();
  }, []);

  // For the quickstart, generate a random group ID.
  // The group Id must be a UUID.
  const groupId = useRef(uuidv4());

  return {
    endpointUrl: ENDPOINT_URL,
    userId: USER_ID,
    token: TOKEN,
    displayName: DISPLAY_NAME,
    groupId: groupId.current,
    threadId,
  };
}

export default App;
