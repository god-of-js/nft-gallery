<template>
  <div>
    <Loader v-model="isMinting" :status="mintStatus" :can-cancel="false" />
    <div class="mass-mint">
      <h1 class="mass-mint-header">What do you wish to create?</h1>
      <div class="mt-7 selection-cards">
        <TypeSelectionCard
          title="Collection"
          :href="`/${urlPrefix}/create`"
          description="Create a collection for your NFTs"
          @select="routeToSelectedCategory">
          <ImageCollection />
        </TypeSelectionCard>
        <TypeSelectionCard
          title="NFT"
          :href="`/${urlPrefix}/create`"
          description="Create awesome NFTs from your art">
          <NftDiamond />
        </TypeSelectionCard>
      </div>
      <div class="experiment-text">Want to experiment? <MagicWand /></div>
    </div>
    <EditPanel
      :nft="nftBeingEdited"
      :open="sideBarOpen"
      @close="sideBarOpen = false"
      @save="updateNFT" />
    <DeleteModal
      v-if="nftInDeleteModal"
      v-model="deleteModalOpen"
      :nft="nftInDeleteModal"
      @close="closeDeleteModal"
      @delete="deleteNFT" />
    <MissingInfoModal
      v-model="missingInfoModalOpen"
      :num-missing-names="numberOfMissingNames"
      :num-missing-descriptions="numberOfMissingDescriptions"
      :num-missing-prices="numberOfMissingPrices"
      @close="missingInfoModalOpen = false" />
    <ReviewModal
      v-model="overViewModalOpen"
      :num-missing-descriptions="numberOfMissingDescriptions"
      :num-missing-prices="numberOfMissingPrices"
      :num-nfts="Object.keys(NFTS).length"
      @close="overViewModalOpen = false"
      @mint="startMint" />
    <MintingModal
      v-model="mintModalOpen"
      :loading="isMinting"
      @close="mintModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { NeoButton, NeoIcon } from '@kodadot1/brick'
import { usePreferencesStore } from '@/stores/preferences'

import UploadMediaZip from './uploadCompressedMedia/UploadCompressedMedia.vue'
import NftDiamond from '@/assets/NftDiamond.vue'
import ImageCollection from '@/assets/ImageCollection.vue'
import MagicWand from '@/assets/MagicWand.vue'
import UploadDescription from './uploadDescription/UploadDescription.vue'
import OverviewTable from './OverviewTable.vue'
import ChooseCollectionDropdown from './ChooseCollectionDropdown.vue'
import TypeSelectionCard from './TypeSelectionCard.vue'
import EditPanel from './EditPanel.vue'
import { NFT, NFTToMint } from './types'
import MissingInfoModal from './modals/MissingInfoModal.vue'
import ReviewModal from './modals/ReviewModal.vue'
import DeleteModal from './modals/DeleteModal.vue'
import MintingModal from './modals/MintingModal.vue'

import { MintedCollection } from '@/composables/transaction/types'
import { notificationTypes, showNotification } from '@/utils/notification'
import { useMassMint } from '@/composables/massmint/useMassMint'
import { Entry } from '@/composables/massmint/parsers/common'
import { FileObject } from '@/composables/massmint/useZipValidator'

const preferencesStore = usePreferencesStore()
const { $consola, $i18n } = useNuxtApp()
const router = useRouter()
const { urlPrefix } = usePrefix()

const selectedCollection = ref<MintedCollection>()
const NFTS = ref<{ [nftId: string]: NFT }>({})
const mediaLoaded = ref(false)

const nftBeingEdited = ref<NFT>()
const nftInDeleteModal = ref<NFT>()
const sideBarOpen = ref(false)
const deleteModalOpen = ref(false)
const missingInfoModalOpen = ref(false)
const overViewModalOpen = ref(false)
const mintModalOpen = ref(false)

const isMinting = ref(false)
const mintStatus = ref('')

const numberOfMissingNames = computed(
  () => Object.values(NFTS.value).filter((nft) => !nft.name).length
)

const numOfValidNFTs = computed(
  () => Object.values(NFTS.value).length - numberOfMissingNames.value
)
const numberOfMissingDescriptions = computed(
  () => Object.values(NFTS.value).filter((nft) => !nft.description).length
)

const numberOfMissingPrices = computed(
  () => Object.values(NFTS.value).filter((nft) => !nft.price).length
)

const openSideBarWith = (nft: NFT) => {
  nftBeingEdited.value = nft
  sideBarOpen.value = true
}
const openDeleteModalWith = (nft: NFT) => {
  nftInDeleteModal.value = nft
  deleteModalOpen.value = true
}
const closeDeleteModal = () => {
  deleteModalOpen.value = false
  nftInDeleteModal.value = undefined
}

const openReviewModal = () => {
  if (numberOfMissingNames.value > 0) {
    missingInfoModalOpen.value = true
    return
  }
  overViewModalOpen.value = true
}

const startMint = () => {
  overViewModalOpen.value = false
  mintModalOpen.value = true
  isMinting.value = true

  const { isLoading, status, collectionUpdated, isError } = useMassMint(
    Object.values(NFTS.value) as NFTToMint[],
    selectedCollection.value as MintedCollection
  )

  watch(
    [isLoading, status, collectionUpdated, isError],
    ([isLoadingV, statusV], [isLoadingOldV]) => {
      isMinting.value = isLoadingV
      mintStatus.value = statusV

      if (isLoadingOldV && !isLoadingV) {
        mintModalOpen.value = false
        if (!isError.value && statusV !== 'loader.sign') {
          showNotification(
            $i18n.t('massmint.continueToCollectionPage'),
            notificationTypes.success
          )
        }
      }

      //redirect to collection page when collection is updated
      if (collectionUpdated.value) {
        navigateTo(
          `/${urlPrefix.value}/collection/${selectedCollection.value?.id}`
        )
      }
    }
  )
}

const onCollectionSelected = (collection) => {
  selectedCollection.value = collection
}

const updateNFT = (nft: NFT) => {
  NFTS.value[nft.id] = nft
}

const deleteNFT = (nft?: NFT) => {
  if (!nft) {
    return
  }
  NFTS.value = Object.values(NFTS.value)
    .filter((n) => n.id !== nft.id)
    .map((nft, i) => ({ ...nft, id: i + 1 }))
    .reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {})

  closeDeleteModal()
}

const toOnborading = () => {
  preferencesStore.setVisitedOnboarding(false)
  router
    .replace({
      path: `/${urlPrefix.value}/massmint/onboarding`,
    })
    .catch($consola.warn)
}

const onMediaZipLoaded = ({ validFiles }: { validFiles: FileObject[] }) => {
  NFTS.value = validFiles
    .map((file, i) => ({ ...file, id: i + 1 }))
    .reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {})
  mediaLoaded.value = true
}
const onDescriptionLoaded = (entries: Record<string, Entry>) => {
  // create a map of nft filename to id
  const nftFileNameToId = Object.values(NFTS.value).reduce(
    (acc, nft) => ({ ...acc, [nft.file.name]: nft.id }),
    {}
  )
  Object.values(entries).forEach((entry) => {
    if (!entry.valid) {
      return
    }
    const nftId = nftFileNameToId[entry.file]
    if (!nftId) {
      return
    }
    const { file: _, ...restOfEntry } = entry
    NFTS.value[nftId] = {
      ...NFTS.value[nftId],
      ...restOfEntry,
    }
  })
}

function routeToSelectedCategory(url: string) {
  router.push(url)
}
</script>
<style lang="scss" scoped>
@import '@/styles/abstracts/variables.scss';

.mass-mint {
  max-width: 600px;
  margin: auto;
  padding-top: 120px;

  .mass-mint-header {
    font-family: Work Sans;
    font-size: 39px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: capitalize;
  }
  .selection-cards {
    display: grid;
    gap: 24px;

    @media screen and (min-width: 560px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .experiment-text {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: capitalize;
    margin-top: 36px;
    svg {
      @include ktheme() {
        fill: theme('text-color');
      }
      width: 30px;
      height: 30px;
    }
  }
}

@include touch {
  .controls {
    flex-direction: column;
    gap: 2rem;
    align-items: flex-start;

    .dropdown-container {
      align-self: center;
    }
    .left {
      position: unset;
    }
  }
}

.limit-width {
  max-width: 45rem;
}
</style>

<style lang="scss">
.tab-nft {
  .explore-tabs-button {
    border-left: 0 !important;
    border-right: 0 !important;
  }
}
</style>
