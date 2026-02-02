import { aircraftDocumentsTag } from '../rtkQuery.tags';
import {
  AircraftDocumentDto,
  AircraftDocumentListDto,
  AircraftDocumentUrlDto,
  UpdateAircraftDocumentRequest,
  DocumentCategory,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export interface UploadAircraftDocumentRequest {
  userId: string;
  aircraftId: string;
  file: File;
  displayName: string;
  category: DocumentCategory;
  description?: string;
}

export const aircraftDocumentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List all documents for an aircraft
    getAircraftDocuments: builder.query<
      AircraftDocumentListDto[],
      { userId: string; aircraftId: string }
    >({
      query: ({ userId, aircraftId }) => ({
        url: `/aircraft/${userId}/${aircraftId}/documents`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: (result, _error, { aircraftId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: aircraftDocumentsTag, id } as const)),
              { type: aircraftDocumentsTag, id: `LIST-${aircraftId}` },
            ]
          : [{ type: aircraftDocumentsTag, id: `LIST-${aircraftId}` }],
    }),

    // Get single document metadata
    getAircraftDocument: builder.query<
      AircraftDocumentDto,
      { userId: string; aircraftId: string; documentId: string }
    >({
      query: ({ userId, aircraftId, documentId }) => ({
        url: `/aircraft/${userId}/${aircraftId}/documents/${documentId}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: (_result, _error, { documentId }) => [
        { type: aircraftDocumentsTag, id: documentId },
      ],
    }),

    // Get presigned URL for viewing/downloading (lazy query)
    getAircraftDocumentUrl: builder.query<
      AircraftDocumentUrlDto,
      { userId: string; aircraftId: string; documentId: string }
    >({
      query: ({ userId, aircraftId, documentId }) => ({
        url: `/aircraft/${userId}/${aircraftId}/documents/${documentId}/url`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // URLs are short-lived, don't cache long
      keepUnusedDataFor: 60,
    }),

    // Upload new document
    uploadAircraftDocument: builder.mutation<AircraftDocumentDto, UploadAircraftDocumentRequest>({
      query: ({ userId, aircraftId, file, displayName, category, description }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('displayName', displayName);
        formData.append('category', category);
        if (description) {
          formData.append('description', description);
        }

        return {
          url: `/aircraft/${userId}/${aircraftId}/documents`,
          method: 'POST',
          body: formData,
          // Don't set Content-Type - browser will set it with boundary
        };
      },
      invalidatesTags: (_result, _error, { aircraftId }) => [
        { type: aircraftDocumentsTag, id: `LIST-${aircraftId}` },
      ],
    }),

    // Update document metadata
    updateAircraftDocument: builder.mutation<
      AircraftDocumentDto,
      { userId: string; aircraftId: string; documentId: string; request: UpdateAircraftDocumentRequest }
    >({
      query: ({ userId, aircraftId, documentId, request }) => ({
        url: `/aircraft/${userId}/${aircraftId}/documents/${documentId}`,
        method: 'PATCH',
        body: request,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: (_result, _error, { aircraftId, documentId }) => [
        { type: aircraftDocumentsTag, id: documentId },
        { type: aircraftDocumentsTag, id: `LIST-${aircraftId}` },
      ],
    }),

    // Replace document file
    replaceAircraftDocument: builder.mutation<
      AircraftDocumentDto,
      { userId: string; aircraftId: string; documentId: string; file: File }
    >({
      query: ({ userId, aircraftId, documentId, file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: `/aircraft/${userId}/${aircraftId}/documents/${documentId}`,
          method: 'PUT',
          body: formData,
          // Don't set Content-Type - browser will set it with boundary
        };
      },
      invalidatesTags: (_result, _error, { aircraftId, documentId }) => [
        { type: aircraftDocumentsTag, id: documentId },
        { type: aircraftDocumentsTag, id: `LIST-${aircraftId}` },
      ],
    }),

    // Delete document
    deleteAircraftDocument: builder.mutation<
      void,
      { userId: string; aircraftId: string; documentId: string }
    >({
      query: ({ userId, aircraftId, documentId }) => ({
        url: `/aircraft/${userId}/${aircraftId}/documents/${documentId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: (_result, _error, { aircraftId, documentId }) => [
        { type: aircraftDocumentsTag, id: documentId },
        { type: aircraftDocumentsTag, id: `LIST-${aircraftId}` },
      ],
    }),
  }),
});

export const {
  useGetAircraftDocumentsQuery,
  useGetAircraftDocumentQuery,
  useLazyGetAircraftDocumentUrlQuery,
  useUploadAircraftDocumentMutation,
  useUpdateAircraftDocumentMutation,
  useReplaceAircraftDocumentMutation,
  useDeleteAircraftDocumentMutation,
} = aircraftDocumentsApi;
