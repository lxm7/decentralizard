import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MaintenancePage from '../../../../src/app/(frontend)/maintenance/page'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { src, alt, onLoad, className } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} onLoad={onLoad} className={className} />
  },
}))

describe('MaintenancePage', () => {
  test('displays the loading logo before the image is loaded', () => {
    render(<MaintenancePage />)

    // Assert that the loader logo is visible
    const loaderLogo = screen.getByAltText('logo-loader')
    expect(loaderLogo).toHaveClass('opacity-100')

    // Assert that the final logo is hidden
    const finalLogo = screen.getByAltText('logo')
    expect(finalLogo).toHaveClass('opacity-0')
  })

  test('displays the final logo after the background image loads', () => {
    render(<MaintenancePage />)

    // Simulate the onLoad event for the background image
    const backgroundImage = screen.getByAltText('Background future space image') as HTMLImageElement
    backgroundImage.onload?.({} as Event)
    // Assert that the final logo is now visible
    const finalLogo = screen.getByAltText('logo')
    expect(finalLogo).toHaveClass('absolute transition-opacity duration-500 opacity-0')

    // Assert that the loader logo is now hidden
    const loaderLogo = screen.getByAltText('logo-loader')
    expect(loaderLogo).toHaveClass('absolute transition-opacity duration-500 opacity-100')
  })

  test('displays the correct text after the image is loaded', () => {
    render(<MaintenancePage />)

    // Simulate the onLoad event for the background image
    const backgroundImage = screen.getByAltText('Background future space image') as HTMLImageElement
    backgroundImage.onload?.({} as Event)

    // Assert that the correct text is displayed
    const finalText = screen.getByText('This site is under construction. Come back soon!')
    expect(finalText).toBeVisible()
  })
})
