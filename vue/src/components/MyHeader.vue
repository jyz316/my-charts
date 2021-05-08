<template>
  <div>
    <nav class="navbar is-dark is-fixed-top" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link class="navbar-item is-size-4 has-text-weight-bold ml-4" :to="'/'">
          My CSV
        </router-link>
        <div class="navbar-burger burger app-burger" :class="{'is-active': menuActive}"
          @click="menuActive = !menuActive">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div id="navbarBasicExample" class="navbar-menu" :class="{'is-active': menuActive}">
        <div class="navbar-start">
          <div class="navbar-item has-dropdown is-hoverable" v-if="activeView">
            <a class="navbar-link">
              <span class="icon-text icon-inline">
                <span class="icon">
                  <v-icon :name="activeView.source.icon"/>
                </span>
                <span>{{activeView.source.label}}</span>
              </span>
            </a>

            <div class="navbar-dropdown">
              <a class="navbar-item" v-for="v in views" :key="'view-header-'+v.id" @click="setActiveView(v)">
                <span class="icon-text icon-inline" :class="{'has-text-link': v.id == activeView.id}">
                  <span class="icon">
                    <v-icon :name="v.source.icon"/>
                  </span>
                  <span>{{v.source.label}}</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <a class="navbar-item" :class="{'mr-4': isElectron}" @click="addView">
            <span class="icon-text px-1">
              <span class="icon">
                <v-icon name="folder-plus" scale="1.2"/>
              </span>
            </span>
          </a>
          <a class="navbar-item" href="./static/downloads/MyEcharts Setup 0.1.0.exe" target="_blank" v-if="!isElectron">
            <span class="icon-text px-1">
              <span class="icon">
                <v-icon name="brands/windows" scale="1.2"/>
              </span>
            </span>
          </a>
          <a class="navbar-item mr-4" href="./static/downloads/MyEcharts-0.1.0.dmg" target="_blank" v-if="!isElectron">
            <span class="icon-text px-1">
              <span class="icon">
                <v-icon name="brands/apple" scale="1.2"/>
              </span>
            </span>
          </a>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'my-header',
  data () {
    return {
      menuActive: false,
      isElectron: xTARGETx == 'electron'
    }
  },
  computed: {
    views () {
      return this.$store.state.views.views
    },
    activeView () {
      return this.$store.state.views.activeView
    }
  },
  methods: {
    addView () {
      this.$store.commit('views/addView')
    },
    setActiveView (view) {
      console.log('commit')
      this.$store.commit('views/setActive', view.id)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.icon-inline {
  display: inline-block;
}
</style>
