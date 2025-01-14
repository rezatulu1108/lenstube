import MetaTags from '@components/Common/MetaTags'
import ChannelShimmer from '@components/Shimmers/ChannelShimmer'
import { Analytics, TRACK } from '@lenstube/browser'
import { trimLensHandle } from '@lenstube/generic'
import { type Profile, useProfileQuery } from '@lenstube/lens'
import useAuthPersistStore from '@lib/store/auth'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import Custom404 from 'src/pages/404'
import Custom500 from 'src/pages/500'

import BasicInfo from './BasicInfo'
import Tabs from './Tabs'

const Channel = () => {
  const { query } = useRouter()
  const handle = query.channel ?? ''
  const selectedSimpleProfile = useAuthPersistStore(
    (state) => state.selectedSimpleProfile
  )

  useEffect(() => {
    Analytics.track('Pageview', { path: TRACK.PAGE_VIEW.CHANNEL })
  }, [])

  const { data, loading, error } = useProfileQuery({
    variables: {
      request: { handle: trimLensHandle(handle as string, true) },
      who: selectedSimpleProfile?.id ?? null
    },
    skip: !handle
  })

  if (error) {
    return <Custom500 />
  }
  if (loading) {
    return <ChannelShimmer />
  }
  if (!data?.profile) {
    return <Custom404 />
  }

  const channel = data?.profile as Profile

  return (
    <>
      <MetaTags title={channel?.handle} />
      {!loading && !error && channel ? (
        <>
          <BasicInfo channel={channel} />
          <Tabs channel={channel} />
        </>
      ) : null}
    </>
  )
}

export default Channel
