import Stripe from 'stripe';
import { logger } from '../config/logger';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY || '';
    if (!apiKey) {
      logger.warn('STRIPE_SECRET_KEY no está configurada. Los pagos con Stripe no funcionarán correctamente.');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-03-31.basil'
    });
  }

  /**
   * Crea una intención de pago en Stripe
   * @param amount Monto en centavos
   * @param currency Moneda (por defecto MXN)
   * @param description Descripción del pago
   * @param metadata Metadatos adicionales
   */
  async createPaymentIntent(amount: number, currency: string = 'mxn', description: string, metadata: Record<string, string> = {}): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // Convertir a centavos si no lo está ya
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        description,
        metadata,
        payment_method_types: ['card'],
      });

      return {
        clientSecret: paymentIntent.client_secret as string,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      logger.error(`Error al crear intención de pago en Stripe: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Confirma un pago en Stripe
   * @param paymentIntentId ID de la intención de pago
   */
  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        return { success: true, status: paymentIntent.status };
      } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
        // Intentar confirmar el pago
        const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
        return {
          success: confirmedIntent.status === 'succeeded',
          status: confirmedIntent.status,
          error: confirmedIntent.status !== 'succeeded' ? 'El pago requiere acción adicional' : undefined
        };
      } else {
        return {
          success: false,
          status: paymentIntent.status,
          error: `El pago no se pudo completar. Estado: ${paymentIntent.status}`
        };
      }
    } catch (error) {
      logger.error(`Error al confirmar pago en Stripe: ${(error as Error).message}`);
      return { success: false, status: 'failed', error: (error as Error).message };
    }
  }

  /**
   * Cancela una intención de pago en Stripe
   * @param paymentIntentId ID de la intención de pago
   */
  async cancelPayment(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      return { success: true };
    } catch (error) {
      logger.error(`Error al cancelar pago en Stripe: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Crea un cliente en Stripe
   * @param email Email del cliente
   * @param name Nombre del cliente
   */
  async createCustomer(email: string, name?: string): Promise<{ customerId: string }> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name
      });

      return { customerId: customer.id };
    } catch (error) {
      logger.error(`Error al crear cliente en Stripe: ${(error as Error).message}`);
      throw error;
    }
  }
}