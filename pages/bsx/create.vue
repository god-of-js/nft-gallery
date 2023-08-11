<template>
  <section>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque impedit
    temporibus hic, omnis odit dolore fugit blanditiis soluta alias sequi
    aspernatur, natus facilis fugiat, quisquam amet possimus voluptates ullam
    explicabo?
    <NeoTabs v-model="activeTab" expanded>
      <NeoTabItem v-for="x in components" :key="x" :label="x">
        <component
          :is="x"
          :show-explainer-text="false"
          @navigateToCreateNftTab="switchToNft" />
      </NeoTabItem>
    </NeoTabs>
  </section>
</template>

<script lang="ts">
import { NeoTabItem, NeoTabs } from '@kodadot1/brick'

const Collection = () =>
  import('@/components/bsx/Create/CreateCollectionPage.vue')
const NFT = () => import('@/components/bsx/Create/CreateToken.vue')

const components = { Collection, NFT, NeoTabItem, NeoTabs }

export default {
  name: 'BsxCreatePage',
  components,
  layout: 'centered-half-layout',
  setup() {
    const { activeTab, components, switchToNft } = useCreate()
    return {
      activeTab,
      components,
      switchToNft,
    }
  },
  head() {
    const title = 'KodaDot | Low fees and low carbon minting'
    const metaData = {
      title,
      type: 'article',
      description: 'Create carbonless NFTs with low on-chain fees',
      url: '/bsx/create',
      image: `${this.$config.public.baseUrl}/k_card.png`,
    }
    return {
      title,
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: this.$root.$config.public.baseUrl + this.$route.path,
        },
      ],
      meta: [...this.$seoMeta(metaData)],
    }
  },
}
</script>
