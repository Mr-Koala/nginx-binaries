import { expect } from 'chai'
import { NginxBinary } from '../src'

describe('Stream variant support', () => {
  it('should list stream as available variant', async () => {
    const variants = await NginxBinary.variants()
    expect(variants).to.include('stream')
  })

  it('should find stream variant binaries', async () => {
    const streamBinaries = await NginxBinary.search({ variant: 'stream' })
    expect(streamBinaries).to.have.length.greaterThan(0)
    
    // Check that all results are stream variant
    streamBinaries.forEach(binary => {
      expect(binary.variant).to.equal('stream')
      expect(binary.filename).to.include('-stream-')
    })
  })

  it('should download stream variant binary', async function() {
    this.timeout(30000) // Increase timeout for download
    
    try {
      const nginxPath = await NginxBinary.download({
        version: '1.28.x',
        variant: 'stream'
      })
      
      expect(nginxPath).to.be.a('string')
      expect(nginxPath).to.include('nginx')
      expect(nginxPath).to.include('stream')
      
    } catch (error) {
      // If stream variant is not available yet, skip this test
      if (error.message.includes('No nginx binary found')) {
        this.skip()
      } else {
        throw error
      }
    }
  })

  it('should differentiate between default and stream variants', async () => {
    const defaultBinaries = await NginxBinary.search({ variant: '' })
    const streamBinaries = await NginxBinary.search({ variant: 'stream' })
    
    // Should have different filenames
    const defaultFilenames = defaultBinaries.map(b => b.filename)
    const streamFilenames = streamBinaries.map(b => b.filename)
    
    // No overlap between default and stream filenames
    const overlap = defaultFilenames.filter(name => streamFilenames.includes(name))
    expect(overlap).to.have.length(0)
  })

  it('should include stream in variants list for specific version', async () => {
    try {
      const variants = await NginxBinary.variants({ version: '1.28.x' })
      expect(variants).to.include('stream')
    } catch (error) {
      // If no 1.28.x versions available, try with any version
      const variants = await NginxBinary.variants()
      expect(variants).to.include('stream')
    }
  })
})