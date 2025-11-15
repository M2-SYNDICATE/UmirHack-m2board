<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '../components/main/AppHeader.vue'
import HeroSection from '../components/main/HeroSection.vue'
import VideoDemo from '../components/main/VideoDemo.vue'
import FeaturesSection from '../components/main/FeaturesSection.vue'
import UseCasesSection from '../components/main/UseCasesSection.vue'
import ScrollToTop from '../components/main/ScrollToTop.vue'

const router = useRouter()

const navigateToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @navigate-to-dashboard="navigateToDashboard" />
    <main>
      <HeroSection @navigate-to-dashboard="navigateToDashboard" />
      <UseCasesSection id="use-cases" />
    </main>
    <ScrollToTop />
  </div>
</template>
