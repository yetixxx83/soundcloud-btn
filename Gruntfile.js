module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-crx');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ["chrome/extension/", "opera/extension/"],
    copy: {
      main: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['extension/**'], dest: 'opera/'},
          {expand: true, src: ['extension/**'], dest: 'chrome/'}
        ]
      },
      production: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['extension/**', '!extension/libs/chromereload.js'], dest: 'opera/'},
          {expand: true, src: ['extension/**', '!extension/libs/chromereload.js'], dest: 'chrome/'}
        ]
      },
    },
    replace: {
      version: {
        src: ['opera/extension/manifest.json', 'chrome/extension/manifest.json'],
        overwrite: true,
        replacements: [
          {
            from: /{VERSION}/g,
            to: "<%= pkg.version %>"
          }
        ]
      },
      opera: {
        src: ['opera/extension/manifest.json', 'opera/extension/libs/analiticsTracking.js','opera/extension/src/options/options.html'],
        overwrite: true,
        replacements: [
          {
            from: /{HOT_KEY}/g,
            to: "C"
          },
          {
            from: /{ANALYTICS}/g,
            to: "2"
          },
          {
            from: /{STORE_URL}/g,
            to: "https://addons.opera.com/en/extensions/details/soundcloud-button/#feedback-container"
          }
          ,
          {
            from: /{BUG_URL}/g,
            to: "https://addons.opera.com/en/extensions/details/soundcloud-button/?reports#feedback-container"
          }
        ]
      },
      chrome: {
        src: ['chrome/extension/manifest.json', 'chrome/extension/libs/analiticsTracking.js','opera/extension/src/options/options.html'],
        overwrite: true,
        replacements: [
          {
            from: /{HOT_KEY}/g,
            to: "A"
          },
          {
            from: /{ANALYTICS}/g,
            to: "1"
          },
          {
            from: /{STORE_URL}/g,
            to: "https://chrome.google.com/webstore/detail/soundcloud-button/gdkpgbhhfnpjiembbpifcpfalfnflmop/reviews"
          },
          {
            from: /{BUG_URL}/g,
            to: "https://chrome.google.com/webstore/support/gdkpgbhhfnpjiembbpifcpfalfnflmop#bug"
          }
        ]
      },
      build: {
        src: ['opera/extension/manifest.json', 'chrome/extension/manifest.json'],
        overwrite: true,
        replacements: [
          {
            from: /{RELOAD}/g,
            to: '"libs/chromereload.js",'
          }
        ]
      },
      production: {
        src: ['opera/extension/manifest.json', 'chrome/extension/manifest.json'],
        overwrite: true,
        replacements: [
          {
            from: /{RELOAD}/g,
            to: ''
          }
        ]
      }
    },
    watch: {
      all: {
        files: ['extension/**'],
        tasks: ['default'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },
    crx: {
      opera: {
        "src": "opera/extension",
        "dest": "opera/soundcloud-btn-<%= pkg.version %>.nex",
        "privateKey": "opera/soundCloudButton.pem"
      }
    },
    compress: {
      chrome: {
        options: {
          archive: "chrome/soundcloud-btn-<%= pkg.version %>.zip"
        },
        files: [
          {
            cwd: "chrome/extension/",
            src: "**",
            expand: true
          }
        ]
      }
    }
  });
  grunt.registerTask('default', ['clean', 'copy:main', 'replace:version', 'replace:opera', 'replace:chrome' , 'replace:build']);
  grunt.registerTask('production', ['clean', 'copy:production', 'replace:version', 'replace:opera', 'replace:chrome' , 'replace:production', 'crx', 'compress:chrome']);
};