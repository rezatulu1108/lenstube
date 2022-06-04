import { useQuery } from '@apollo/client'
import { SuggestedVideosShimmer } from '@components/Shimmers/VideoDetailShimmer'
import { Loader } from '@components/UIElements/Loader'
import { LENSTUBE_VIDEOS_APP_ID } from '@utils/constants'
import getThumbnailUrl from '@utils/functions/getThumbnailUrl'
import imageCdn from '@utils/functions/imageCdn'
import { EXPLORE_QUERY } from '@utils/gql/queries'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React, { useState } from 'react'
import { useInView } from 'react-cool-inview'
import { PaginatedResultInfo } from 'src/types'
import { LenstubePublication } from 'src/types/local'
dayjs.extend(relativeTime)

const SuggestedVideos = () => {
  const [videos, setVideos] = useState<LenstubePublication[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { loading, error, fetchMore } = useQuery(EXPLORE_QUERY, {
    variables: {
      request: {
        sortCriteria: 'TOP_COMMENTED',
        limit: 10,
        sources: [LENSTUBE_VIDEOS_APP_ID],
        publicationTypes: ['POST']
      }
    },
    onCompleted(data) {
      setPageInfo(data?.explorePublications?.pageInfo)
      setVideos(data?.explorePublications?.items)
    }
  })

  const { observe } = useInView({
    threshold: 1,
    onEnter: () => {
      fetchMore({
        variables: {
          request: {
            cursor: pageInfo?.next,
            sortCriteria: 'TOP_COMMENTED',
            limit: 10,
            sources: [LENSTUBE_VIDEOS_APP_ID],
            publicationTypes: ['POST']
          }
        }
      }).then(({ data }: any) => {
        setPageInfo(data?.explorePublications?.pageInfo)
        setVideos([...videos, ...data?.explorePublications?.items])
      })
    }
  })
  if (loading) {
    return <SuggestedVideosShimmer />
  }

  return (
    <>
      {!error && !loading && (
        <div className="pb-3">
          <div className="space-y-3 md:gap-3 md:grid lg:flex lg:gap-0 lg:flex-col md:grid-cols-2">
            {videos?.map((video: LenstubePublication, index: number) => (
              <div key={index} className="flex">
                <div className="flex-none overflow-hidden rounded">
                  <img
                    src={imageCdn(getThumbnailUrl(video))}
                    alt=""
                    draggable={false}
                    className="object-cover object-center h-24 w-44"
                  />
                </div>
                <div className="flex items-start px-2.5">
                  <div className="flex flex-col items-start flex-1 pb-1">
                    <span className="flex w-full items-start justify-between space-x-1.5">
                      <Link passHref href={`/videos/${video.id}`}>
                        <a className="mb-1.5 text-sm font-medium line-clamp-2">
                          {video.metadata?.name}
                        </a>
                      </Link>
                    </span>
                    <Link href={`/${video.profile?.handle}`}>
                      <a className="text-xs hover:opacity-100 opacity-70">
                        {video.profile?.handle}
                      </a>
                    </Link>
                    <div className="flex items-center text-[11px] opacity-70 mt-0.5">
                      <span>{dayjs(new Date(video.createdAt)).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pageInfo?.next && videos.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Loader />
            </span>
          )}
        </div>
      )}
    </>
  )
}

export default SuggestedVideos
