import sys 
import cv2

def image_contrast(image_path):
    print('Starting Python function: contrast', file=sys.stderr)
    
    try:
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        _, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2)
        
        new_image_path = "./src/images/processed_image.jpg"
        cv2.imwrite(new_image_path, img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        
        print(new_image_path)
        return new_image_path

    except Exception as e:
        print('Error in image_contrast:', str(e), file=sys.stderr)
        raise

if __name__ == "__main__":
    try: 
        if len(sys.argv) < 1:
            raise ValueError("No image path provided")
        image_path = sys.argv[1]
        print('Main block: Image path received:', image_path, file=sys.stderr)
        result = image_contrast(image_path)
    except Exception as e:
        print('Main block error:', str(e), file=sys.stderr)
        sys.exit(1)